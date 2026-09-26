@router.post(
    "/google",
    response_model=AccessTokenResponse,
    summary="Sign in or register with a verified Google account",
)
def google_auth(
    data: GoogleAuthRequest,
    db: Annotated[Session, Depends(get_db)],
) -> AccessTokenResponse:
    """Verify a Google ID token, find-or-create the user, and issue a StockSense JWT."""

    try:
        payload = google_id_token.verify_oauth2_token(
            data.id_token,
            google_requests.Request(),
            GOOGLE_CLIENT_ID,
        )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Google token",
        ) from None

    if payload.get("iss") not in (
        "accounts.google.com",
        "https://accounts.google.com",
    ):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token issuer",
        )

    email = payload.get("email")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Google account did not provide an email address",
        )

    if not payload.get("email_verified", False):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Google email address is not verified",
        )

    google_sub = payload.get("sub")
    name = payload.get("name") or email.split("@", 1)[0]

    user = db.query(User).filter(User.email == email).first()

    if user is None:
        user = User(
            name=name,
            email=email,
            hashed_password=hash_password(
                secrets.token_urlsafe(32)
            ),
            google_id=google_sub,
            is_active=True,
        )

        db.add(user)

        try:
            db.commit()
        except Exception:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Could not create account, please try again",
            ) from None

        db.refresh(user)

    else:
        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="This account has been disabled",
            )

        if not user.google_id:
            user.google_id = google_sub
            db.commit()
            db.refresh(user)

    try:
        token = issue_access_token(user)
    except RuntimeError as error:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(error),
        ) from None

    logger.info(
        "Google user authenticated: id=%s",
        user.id,
    )

    return AccessTokenResponse(
        access_token=token
    )