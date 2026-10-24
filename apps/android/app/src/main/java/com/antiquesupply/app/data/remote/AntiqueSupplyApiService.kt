package com.antiquesupply.app.data.remote

import com.antiquesupply.app.data.model.*
import retrofit2.Response
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import retrofit2.http.*
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import java.util.concurrent.TimeUnit

data class ApiResponse<T>(
    val success: Boolean,
    val data: T,
    val message: String? = null,
    val error: String? = null
)

data class TransitionRequest(
    val nextStatus: String,
    val notes: String? = null,
    val trackingReference: String? = null
)

interface AntiqueSupplyApiService {
    @GET("api/v1/products")
    suspend fun getProducts(
        @Query("category") category: String? = null,
        @Query("municipality") municipality: String? = null,
        @Query("q") query: String? = null
    ): Response<ApiResponse<List<ProductDto>>>

    @GET("api/v1/organizations")
    suspend fun getOrganizations(
        @Query("type") type: String? = null
    ): Response<ApiResponse<List<OrganizationDto>>>

    @GET("api/v1/rfqs")
    suspend fun getRfqs(
        @Query("status") status: String? = null,
        @Query("org_id") orgId: String? = null
    ): Response<ApiResponse<List<RfqDto>>>

    @POST("api/v1/rfqs")
    suspend fun createRfq(
        @Body rfq: RfqDto
    ): Response<ApiResponse<RfqDto>>

    @GET("api/v1/orders")
    suspend fun getOrders(
        @Query("status") status: String? = null,
        @Query("org_id") orgId: String? = null
    ): Response<ApiResponse<List<PurchaseOrderDto>>>

    @POST("api/v1/orders")
    suspend fun createOrder(
        @Body order: PurchaseOrderDto
    ): Response<ApiResponse<PurchaseOrderDto>>

    @POST("api/v1/orders/{id}/transition")
    suspend fun transitionOrderStatus(
        @Path("id") orderId: String,
        @Body request: TransitionRequest
    ): Response<ApiResponse<Map<String, Any>>>

    companion object {
        private const val DEFAULT_BASE_URL = "http://10.0.2.2:3000/" // Android emulator localhost mapping

        fun create(baseUrl: String = DEFAULT_BASE_URL): AntiqueSupplyApiService {
            val logging = HttpLoggingInterceptor().apply {
                level = HttpLoggingInterceptor.Level.BODY
            }

            val client = OkHttpClient.Builder()
                .addInterceptor(logging)
                .connectTimeout(15, TimeUnit.SECONDS)
                .readTimeout(15, TimeUnit.SECONDS)
                .build()

            return Retrofit.Builder()
                .baseUrl(baseUrl)
                .client(client)
                .addConverterFactory(GsonConverterFactory.create())
                .build()
                .create(AntiqueSupplyApiService::class.java)
        }
    }
}
