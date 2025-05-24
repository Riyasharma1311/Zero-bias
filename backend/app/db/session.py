from typing import AsyncGenerator, TypeVar, Type, Optional, List, Any
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select, delete, update
from sqlalchemy.sql import Select

from app.core.config import get_settings

settings = get_settings()

# Create async engine with aiosqlite
# Convert sqlite:/// to sqlite+aiosqlite:///
db_url = settings.DATABASE_URL.replace('sqlite:///', 'sqlite+aiosqlite:///')
engine = create_async_engine(
    db_url,
    echo=settings.DEBUG,
    # Required for SQLite
    connect_args={"check_same_thread": False}
)

# Create async session factory
AsyncSessionLocal = sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False
)

# Type variable for ORM models
ModelType = TypeVar("ModelType")

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    """Dependency for getting async database sessions."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def get_by_id(
    db: AsyncSession,
    model: Type[ModelType],
    id: Any
) -> Optional[ModelType]:
    """Get a single record by ID."""
    result = await db.execute(select(model).filter(model.id == id))
    return result.scalar_one_or_none()

async def get_by_field(
    db: AsyncSession,
    model: Type[ModelType],
    field: str,
    value: Any
) -> Optional[ModelType]:
    """Get a single record by field value."""
    stmt = select(model).filter(getattr(model, field) == value)
    result = await db.execute(stmt)
    return result.scalar_one_or_none()

async def get_all(
    db: AsyncSession,
    model: Type[ModelType],
    *,
    skip: int = 0,
    limit: int = 100,
    stmt: Optional[Select] = None
) -> List[ModelType]:
    """Get multiple records with optional pagination."""
    if stmt is None:
        stmt = select(model)
    
    if skip:
        stmt = stmt.offset(skip)
    if limit:
        stmt = stmt.limit(limit)
        
    result = await db.execute(stmt)
    return result.scalars().all()

async def create(
    db: AsyncSession,
    model: Type[ModelType],
    **kwargs
) -> ModelType:
    """Create a new record."""
    db_obj = model(**kwargs)
    db.add(db_obj)
    await db.commit()
    await db.refresh(db_obj)
    return db_obj

async def update_by_id(
    db: AsyncSession,
    model: Type[ModelType],
    id: Any,
    **kwargs
) -> Optional[ModelType]:
    """Update a record by ID."""
    stmt = update(model).where(model.id == id).values(**kwargs)
    await db.execute(stmt)
    await db.commit()
    return await get_by_id(db, model, id)

async def delete_by_id(
    db: AsyncSession,
    model: Type[ModelType],
    id: Any
) -> bool:
    """Delete a record by ID."""
    stmt = delete(model).where(model.id == id)
    result = await db.execute(stmt)
    await db.commit()
    return result.rowcount > 0 