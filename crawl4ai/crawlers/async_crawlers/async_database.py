from typing import Optional
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

class AsyncDatabaseManager:
    def __init__(self, database_url: str = "sqlite+aiosqlite:///./test.db"):
        self.engine = create_async_engine(database_url, echo=True)
        self.async_session = sessionmaker(
            self.engine, class_=AsyncSession, expire_on_commit=False
        )

    async def get_session(self) -> AsyncSession:
        async with self.async_session() as session:
            yield session

# Initialize default database manager
async_db_manager = AsyncDatabaseManager()
