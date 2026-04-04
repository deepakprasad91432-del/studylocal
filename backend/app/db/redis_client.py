from upstash_redis.asyncio import Redis
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)

class RedisClient:
    def __init__(self):
        self.redis: Redis = None
        self.is_connected = False
        self._failed_permanently = False

    async def connect(self):
        if self._failed_permanently:
            return None
        
        if not settings.UPSTASH_REDIS_REST_URL or not settings.UPSTASH_REDIS_REST_TOKEN:
            logger.info("[Redis] Upstash credentials not set — caching disabled.")
            self._failed_permanently = True
            return None

        try:
            # Upstash Redis is HTTP-based, so connection is immediate
            self.redis = Redis(
                url=settings.UPSTASH_REDIS_REST_URL, 
                token=settings.UPSTASH_REDIS_REST_TOKEN
            )
            # Test connection with a ping
            await self.redis.ping()
            self.is_connected = True
            logger.info("[Redis] Connected to Upstash successfully.")
        except Exception as e:
            logger.warning(f"[Redis] Upstash connection failed: {e}. Falling back to MongoDB.")
            self.is_connected = False
            self._failed_permanently = True
            self.redis = None

    async def get(self, key: str):
        if not self.is_connected or not self.redis:
            return None
        try:
            return await self.redis.get(key)
        except Exception as e:
            logger.error(f"[Redis] Get error for key {key}: {e}")
            return None

    async def set(self, key: str, value: str, expire: int = 60 * 60):
        if not self.is_connected or not self.redis:
            return False
        try:
            # Upstash SDK uses 'ex' for expiry seconds
            await self.redis.set(key, value, ex=expire)
            return True
        except Exception as e:
            logger.error(f"[Redis] Set error for key {key}: {e}")
            return False

    async def delete(self, key: str):
        if not self.is_connected or not self.redis:
            return False
        try:
            await self.redis.delete(key)
            return True
        except Exception as e:
            logger.error(f"[Redis] Delete error for key {key}: {e}")
            return False

    async def delete_pattern(self, pattern: str):
        """Scan and delete all keys matching a glob pattern (e.g. 'tutor_search:*')"""
        if not self.is_connected or not self.redis:
            return 0
        try:
            cursor = 0
            deleted = 0
            while True:
                cursor, keys = await self.redis.scan(cursor, match=pattern, count=100)
                if keys:
                    await self.redis.delete(*keys)
                    deleted += len(keys)
                if cursor == 0:
                    break
            logger.info(f"[Redis] Deleted {deleted} keys matching '{pattern}'")
            return deleted
        except Exception as e:
            logger.error(f"[Redis] Delete pattern error for '{pattern}': {e}")
            return 0

    async def close(self):
        # Upstash AsyncRedis uses a session that should be closed
        if self.redis:
            await self.redis.close()

redis_client = RedisClient()
