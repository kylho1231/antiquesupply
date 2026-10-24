package com.antiquesupply.app.data.model

import com.google.gson.annotations.SerializedName

val ANTIQUE_MUNICIPALITIES = listOf(
    "Anini-y", "Barbaza", "Belison", "Bugasong", "Caluya", "Culasi",
    "Hamtic", "Laua-an", "Libertad", "Pandan", "Patnongon",
    "San Jose de Buenavista", "San Remigio", "Sebaste", "Sibalom",
    "Tibiao", "Tobias Fornier", "Valderrama"
)

enum class OrderStatus {
    @SerializedName("draft") DRAFT,
    @SerializedName("submitted") SUBMITTED,
    @SerializedName("confirmed") CONFIRMED,
    @SerializedName("preparing") PREPARING,
    @SerializedName("ready_for_dispatch") READY_FOR_DISPATCH,
    @SerializedName("dispatched") DISPATCHED,
    @SerializedName("delivered") DELIVERED,
    @SerializedName("received") RECEIVED,
    @SerializedName("cancelled") CANCELLED,
    @SerializedName("disputed") DISPUTED;

    fun canTransitionTo(next: OrderStatus): Boolean {
        return when (this) {
            DRAFT -> next in listOf(SUBMITTED, CANCELLED)
            SUBMITTED -> next in listOf(CONFIRMED, CANCELLED)
            CONFIRMED -> next in listOf(PREPARING, CANCELLED)
            PREPARING -> next in listOf(READY_FOR_DISPATCH, CANCELLED)
            READY_FOR_DISPATCH -> next in listOf(DISPATCHED, CANCELLED)
            DISPATCHED -> next in listOf(DELIVERED, DISPUTED)
            DELIVERED -> next in listOf(RECEIVED, DISPUTED)
            DISPUTED -> next in listOf(RECEIVED, CANCELLED)
            RECEIVED, CANCELLED -> false
        }
    }
}

data class ProductDto(
    val id: String,
    @SerializedName("organization_id") val organizationId: String,
    @SerializedName("category_id") val categoryId: String,
    val name: String,
    val sku: String,
    val description: String,
    val unit: String,
    @SerializedName("base_price") val basePrice: Double,
    @SerializedName("min_order_quantity") val minOrderQuantity: Int,
    @SerializedName("lead_time_days") val leadTimeDays: Int,
    @SerializedName("origin_municipality") val originMunicipality: String,
    @SerializedName("image_urls") val imageUrls: List<String> = emptyList(),
    @SerializedName("is_demo") val isDemo: Boolean = false,
    @SerializedName("stock_available") val stockAvailable: Int = 0,
    @SerializedName("is_made_to_order") val isMadeToOrder: Boolean = false
)

data class OrganizationDto(
    val id: String,
    @SerializedName("legal_name") val legalName: String,
    @SerializedName("trade_name") val tradeName: String,
    @SerializedName("org_type") val orgType: String,
    val municipality: String,
    val province: String,
    @SerializedName("verified_status") val verifiedStatus: String,
    @SerializedName("contact_email") val contactEmail: String,
    @SerializedName("contact_phone") val contactPhone: String,
    val description: String? = null
)

data class RfqItemDto(
    val id: String? = null,
    @SerializedName("item_title") val itemTitle: String,
    val specifications: String,
    val quantity: Double,
    val unit: String,
    @SerializedName("target_unit_price") val targetUnitPrice: Double? = null
)

data class RfqDto(
    val id: String,
    @SerializedName("rfq_number") val rfqNumber: String,
    val title: String,
    @SerializedName("buyer_org_id") val buyerOrgId: String,
    @SerializedName("buyer_name") val buyerName: String,
    @SerializedName("supplier_org_id") val supplierOrgId: String? = null,
    @SerializedName("supplier_name") val supplierName: String? = null,
    val status: String,
    @SerializedName("delivery_address") val deliveryAddress: String,
    @SerializedName("delivery_municipality") val deliveryMunicipality: String,
    @SerializedName("delivery_province") val deliveryProvince: String,
    @SerializedName("target_delivery_date") val targetDeliveryDate: String,
    @SerializedName("response_deadline") val responseDeadline: String,
    @SerializedName("target_budget") val targetBudget: Double? = null,
    val notes: String? = null,
    val items: List<RfqItemDto> = emptyList()
)

data class PurchaseOrderItemDto(
    val id: String,
    @SerializedName("product_id") val productId: String? = null,
    @SerializedName("item_title") val itemTitle: String,
    val unit: String,
    val quantity: Double,
    @SerializedName("agreed_unit_price") val agreedUnitPrice: Double,
    @SerializedName("line_total") val lineTotal: Double
)

data class PurchaseOrderDto(
    val id: String,
    @SerializedName("po_number") val poNumber: String,
    @SerializedName("rfq_id") val rfqId: String? = null,
    @SerializedName("quotation_id") val quotationId: String? = null,
    @SerializedName("buyer_org_id") val buyerOrgId: String,
    @SerializedName("buyer_name") val buyerName: String,
    @SerializedName("supplier_org_id") val supplierOrgId: String,
    @SerializedName("supplier_name") val supplierName: String,
    val status: OrderStatus,
    val subtotal: Double,
    @SerializedName("delivery_fee") val deliveryFee: Double,
    @SerializedName("grand_total") val grandTotal: Double,
    @SerializedName("delivery_address") val deliveryAddress: String,
    @SerializedName("delivery_municipality") val deliveryMunicipality: String,
    @SerializedName("delivery_province") val deliveryProvince: String,
    @SerializedName("delivery_date_agreed") val deliveryDateAgreed: String,
    @SerializedName("tracking_reference") val trackingReference: String? = null,
    val notes: String? = null,
    val items: List<PurchaseOrderItemDto> = emptyList()
)
