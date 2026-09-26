from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.dependencies import get_db, require_inventory_manager
from app.models.reorder_rule import ReorderRule
from app.models.user import User
from app.schemas.reorder_rule import ReorderRuleCreate, ReorderRuleResponse
from app.services import master_data


router = APIRouter(prefix="/reorder-rules", tags=["Reorder Rules"])


@router.get("", response_model=list[ReorderRuleResponse], summary="List reorder rules")
def list_reorder_rules(
    db: Annotated[Session, Depends(get_db)],
) -> list[ReorderRule]:
    return master_data.list_reorder_rules(db)


@router.post(
    "",
    response_model=ReorderRuleResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a reorder rule",
)
def create_reorder_rule(
    data: ReorderRuleCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> ReorderRule:
    return master_data.save_reorder_rule(db, data)


@router.put(
    "/{rule_id}",
    response_model=ReorderRuleResponse,
    summary="Update a reorder rule",
)
def update_reorder_rule(
    rule_id: int,
    data: ReorderRuleCreate,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> ReorderRule:
    return master_data.save_reorder_rule(db, data, rule_id)


@router.delete(
    "/{rule_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a reorder rule",
)
def delete_reorder_rule(
    rule_id: int,
    db: Annotated[Session, Depends(get_db)],
    _: Annotated[User, Depends(require_inventory_manager)],
) -> Response:
    master_data.delete_reorder_rule(db, rule_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
