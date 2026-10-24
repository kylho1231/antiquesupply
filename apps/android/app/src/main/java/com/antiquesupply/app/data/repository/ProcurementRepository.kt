package com.antiquesupply.app.data.repository

import com.antiquesupply.app.data.local.*
import com.antiquesupply.app.data.model.*
import com.antiquesupply.app.data.remote.AntiqueSupplyApiService
import com.antiquesupply.app.data.remote.TransitionRequest
import com.google.gson.Gson
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow

class ProcurementRepository(
    private val api: AntiqueSupplyApiService,
    private val draftDao: DraftRfqDao,
    private val productDao: CachedProductDao
) {
    private val gson = Gson()

    fun getCachedProducts(): Flow<List<CachedProductEntity>> = productDao.getAllProducts()

    fun getOfflineDrafts(): Flow<List<DraftRfqEntity>> = draftDao.getAllDrafts()

    suspend fun fetchAndCacheProducts(municipality: String? = null): Result<List<ProductDto>> {
        return try {
            val response = api.getProducts(municipality = municipality)
            if (response.isSuccessful && response.body()?.success == true) {
                val list = response.body()!!.data
                // Cache locally into Room
                val entities = list.map {
                    CachedProductEntity(
                        id = it.id,
                        name = it.name,
                        sku = it.sku,
                        description = it.description,
                        categoryId = it.categoryId,
                        originMunicipality = it.originMunicipality,
                        basePrice = it.basePrice,
                        minOrderQuantity = it.minOrderQuantity,
                        unit = it.unit,
                        leadTimeDays = it.leadTimeDays,
                        isMadeToOrder = it.isMadeToOrder,
                        imageUrl = it.imageUrls.firstOrNull()
                    )
                }
                productDao.insertAll(entities)
                Result.success(list)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to fetch products"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun saveOfflineDraftRfq(
        title: String,
        municipality: String,
        address: String,
        targetDeliveryDate: String,
        responseDeadline: String,
        targetBudget: Double,
        items: List<RfqItemDto>,
        notes: String
    ): Long {
        val draft = DraftRfqEntity(
            title = title,
            deliveryMunicipality = municipality,
            deliveryAddress = address,
            targetDeliveryDate = targetDeliveryDate,
            responseDeadline = responseDeadline,
            targetBudget = targetBudget,
            lineItemsJson = gson.toJson(items),
            notes = notes,
            isSynced = false
        )
        return draftDao.insertDraft(draft)
    }

    suspend fun submitRfq(rfq: RfqDto): Result<RfqDto> {
        return try {
            val response = api.createRfq(rfq)
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to submit RFQ"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun getOrders(): Result<List<PurchaseOrderDto>> {
        return try {
            val response = api.getOrders()
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(response.body()!!.data)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to load orders"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }

    suspend fun transitionOrderStatus(
        orderId: String,
        nextStatus: OrderStatus,
        notes: String? = null,
        trackingRef: String? = null
    ): Result<Unit> {
        return try {
            val response = api.transitionOrderStatus(
                orderId,
                TransitionRequest(
                    nextStatus = nextStatus.name.lowercase(),
                    notes = notes,
                    trackingReference = trackingRef
                )
            )
            if (response.isSuccessful && response.body()?.success == true) {
                Result.success(Unit)
            } else {
                Result.failure(Exception(response.body()?.error ?: "Failed to transition status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}
