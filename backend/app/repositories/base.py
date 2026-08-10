"""
Generic repository base class.

Repositories abstract CRUD operations over a SQLAlchemy session. This generic
base provides the common operations; domain repositories (added in later
milestones) will extend it with query-specific methods.
"""

from typing import Any, Dict, Generic, List, Optional, Type, TypeVar

from sqlalchemy import Select, func, select
from sqlalchemy.orm import Session

from app.db.session import Base

ModelType = TypeVar("ModelType", bound=Base)


class BaseRepository(Generic[ModelType]):
    """
    Generic CRUD repository for a SQLAlchemy model.

    Example:
        class UserRepository(BaseRepository[User]):
            ...

        repo = UserRepository(db, User)
    """

    def __init__(self, db: Session, model: Type[ModelType]) -> None:
        self.db = db
        self.model = model

    def get(self, obj_id: str) -> Optional[ModelType]:
        """Fetch a single record by primary key."""
        return self.db.get(self.model, obj_id)

    def get_by_field(self, field: str, value: Any) -> Optional[ModelType]:
        """Fetch a single record by an arbitrary column value."""
        column = getattr(self.model, field)
        stmt = select(self.model).where(column == value)
        return self.db.scalars(stmt).first()

    def list(
        self,
        skip: int = 0,
        limit: int = 100,
        order_by: Optional[str] = None,
        descending: bool = True,
    ) -> List[ModelType]:
        """List records with optional ordering."""
        stmt: Select = select(self.model)
        if order_by:
            column = getattr(self.model, order_by)
            stmt = stmt.order_by(column.desc() if descending else column.asc())
        stmt = stmt.offset(skip).limit(limit)
        return list(self.db.scalars(stmt).all())

    def count(self, *filters) -> int:
        """Count records, optionally filtered by SQLAlchemy conditions."""
        stmt = select(func.count()).select_from(self.model)
        if filters:
            stmt = stmt.where(*filters)
        return int(self.db.scalars(stmt).one())

    def create(self, **kwargs) -> ModelType:
        """Create a new record from keyword attributes."""
        obj = self.model(**kwargs)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def update(self, obj: ModelType, **kwargs) -> ModelType:
        """Update a record in place from keyword attributes."""
        for key, value in kwargs.items():
            setattr(obj, key, value)
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def save(self, obj: ModelType) -> ModelType:
        """Persist an already-modified ORM object."""
        self.db.add(obj)
        self.db.commit()
        self.db.refresh(obj)
        return obj

    def delete(self, obj: ModelType) -> None:
        """Delete a record."""
        self.db.delete(obj)
        self.db.commit()

    def bulk_create(self, objects: List[ModelType]) -> List[ModelType]:
        """Add and commit a batch of records."""
        self.db.add_all(objects)
        self.db.commit()
        for obj in objects:
            self.db.refresh(obj)
        return objects

