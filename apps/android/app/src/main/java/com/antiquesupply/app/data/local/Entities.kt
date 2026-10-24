package com.antiquesupply.app.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "draft_rfqs")
data class DraftRfqEntity(
    @PrimaryKey(autoGenerate = true) val localId: Long = 0,
    val title: String,
    val deliveryMunicipality: String,
    val deliveryAddress: String,
    val targetDeliveryDate: String,
    val responseDeadline: String,
    val targetBudget: Double,
    val lineItemsJson: String,
    val notes: String,
    val createdAt: Long = System.currentTimeMillis(),
    val isSynced: Boolean = false
)

@Dao
interface DraftRfqDao {
    @Query("SELECT * FROM draft_rfqs ORDER BY createdAt DESC")
    fun getAllDrafts(): Flow<List<DraftRfqEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertDraft(draft: DraftRfqEntity): Long

    @Delete
    suspend fun deleteDraft(draft: DraftRfqEntity)

    @Query("DELETE FROM draft_rfqs WHERE localId = :id")
    suspend fun deleteById(id: Long)
}

@Entity(tableName = "cached_products")
data class CachedProductEntity(
    @PrimaryKey val id: String,
    val name: String,
    val sku: String,
    val description: String,
    val categoryId: String,
    val originMunicipality: String,
    val basePrice: Double,
    val minOrderQuantity: Int,
    val unit: String,
    val leadTimeDays: Int,
    val isMadeToOrder: Boolean,
    val imageUrl: String?
)

@Dao
interface CachedProductDao {
    @Query("SELECT * FROM cached_products ORDER BY name ASC")
    fun getAllProducts(): Flow<List<CachedProductEntity>>

    @Query("SELECT * FROM cached_products WHERE originMunicipality = :municipality")
    fun getProductsByMunicipality(municipality: String): Flow<List<CachedProductEntity>>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(products: List<CachedProductEntity>)

    @Query("DELETE FROM cached_products")
    suspend fun clearAll()
}

@Database(
    entities = [DraftRfqEntity::class, CachedProductEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AntiqueSupplyDatabase : RoomDatabase() {
    abstract fun draftRfqDao(): DraftRfqDao
    abstract fun cachedProductDao(): CachedProductDao
}
