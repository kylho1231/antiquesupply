package com.antiquesupply.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.navigation.compose.*
import com.antiquesupply.app.data.model.*
import com.antiquesupply.app.ui.screens.*
import com.antiquesupply.app.ui.theme.AntiqueSupplyTheme
import com.antiquesupply.app.ui.theme.ForestGreen
import com.antiquesupply.app.ui.theme.WarmAmber

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            AntiqueSupplyTheme {
                MainAppScaffold()
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MainAppScaffold() {
    val navController = rememberNavController()
    var currentScreen by remember { mutableStateOf("catalog") }

    // Seed mock data for Android demo / offline fallback
    val mockProducts = remember {
        listOf(
            ProductDto(
                id = "p-001",
                organizationId = "org-001",
                categoryId = "cat-sugar",
                name = "Antique Premium Muscovado Sugar (50kg)",
                sku = "LAU-MUSC-50KG",
                description = "Export grade organic muscovado sugar from Laua-an steam evaporator mill.",
                unit = "sack",
                basePrice = 4250.0,
                minOrderQuantity = 2,
                leadTimeDays = 3,
                originMunicipality = "Laua-an",
                imageUrls = listOf("https://images.unsplash.com/photo-1581441363689-1f3c3c414635?w=600"),
                stockAvailable = 75
            ),
            ProductDto(
                id = "p-002",
                organizationId = "org-002",
                categoryId = "cat-weaving",
                name = "Bagtason Handwoven Patadyong Bed Runner",
                sku = "BAG-RUNNER-QK",
                description = "Artisanal multi-color Hablon woven bed runner for resorts.",
                unit = "piece",
                basePrice = 1150.0,
                minOrderQuantity = 10,
                leadTimeDays = 14,
                originMunicipality = "Bugasong",
                imageUrls = listOf("https://images.unsplash.com/photo-1606744888344-498238f0176a?w=600"),
                stockAvailable = 20
            ),
            ProductDto(
                id = "p-003",
                organizationId = "org-003",
                categoryId = "cat-coconut",
                name = "Pure Centrifugal Virgin Coconut Oil (20L)",
                sku = "TIB-VCO-20L",
                description = "Cold pressed organic VCO for culinary and spa applications.",
                unit = "box",
                basePrice = 4600.0,
                minOrderQuantity = 2,
                leadTimeDays = 5,
                originMunicipality = "Tibiao",
                imageUrls = listOf("https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=600"),
                stockAvailable = 36
            )
        )
    }

    val mockOrders = remember {
        mutableStateListOf(
            PurchaseOrderDto(
                id = "po-001",
                poNumber = "PO-2026-0042",
                buyerOrgId = "org-buy-001",
                buyerName = "Boracay Palms Beach Resort",
                supplierOrgId = "org-sup-001",
                supplierName = "Laua-an Muscovado Producers Coop",
                status = OrderStatus.CONFIRMED,
                subtotal = 42000.0,
                deliveryFee = 1500.0,
                grandTotal = 43500.0,
                deliveryAddress = "Caticlan Jetty Port Cargo Receiving, Malay",
                deliveryMunicipality = "Boracay (Malay)",
                deliveryProvince = "Aklan",
                deliveryDateAgreed = "2026-11-04T12:00:00Z",
                trackingReference = "PANAY-LOG-2026-991",
                items = listOf(
                    PurchaseOrderItemDto(
                        id = "poi-001",
                        itemTitle = "Antique Premium Muscovado Sugar (50kg)",
                        unit = "sack",
                        quantity = 10.0,
                        agreedUnitPrice = 4200.0,
                        lineTotal = 42000.0
                    )
                )
            )
        )
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = {
                    Row(verticalAlignment = androidx.compose.ui.Alignment.CenterVertically) {
                        Surface(
                            shape = RoundedCornerShape(6.dp),
                            color = ForestGreen,
                            modifier = Modifier.size(28.dp)
                        ) {
                            Box(contentAlignment = androidx.compose.ui.Alignment.Center) {
                                Text("AS", color = WarmAmber, fontWeight = FontWeight.Black, fontSize = 12.sp)
                            }
                        }
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text("AntiqueSupply", fontWeight = FontWeight.Bold, fontSize = 16.sp, color = Color.White)
                            Text("Local Products. Bigger Markets.", fontSize = 9.sp, color = Color(0xFFC8E6C9))
                        }
                    }
                },
                colors = TopAppBarDefaults.topAppBarColors(containerColor = ForestGreen)
            )
        },
        bottomBar = {
            NavigationBar(containerColor = Color.White) {
                NavigationBarItem(
                    selected = currentScreen == "catalog",
                    onClick = { currentScreen = "catalog" },
                    icon = { Icon(Icons.Default.Storefront, contentDescription = "Marketplace") },
                    label = { Text("Marketplace", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == "create_rfq",
                    onClick = { currentScreen = "create_rfq" },
                    icon = { Icon(Icons.Default.AddCircleOutline, contentDescription = "New RFQ") },
                    label = { Text("New RFQ", fontSize = 10.sp) }
                )
                NavigationBarItem(
                    selected = currentScreen == "orders",
                    onClick = { currentScreen = "orders" },
                    icon = { Icon(Icons.Default.ReceiptLong, contentDescription = "Orders") },
                    label = { Text("Orders", fontSize = 10.sp) }
                )
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.padding(paddingValues)) {
            when (currentScreen) {
                "catalog" -> CatalogScreen(
                    products = mockProducts,
                    onProductClick = { /* Inspect */ },
                    onRequestQuote = { currentScreen = "create_rfq" }
                )
                "create_rfq" -> CreateRfqScreen(
                    onSubmit = { title, muni, addr, budget ->
                        currentScreen = "orders"
                    },
                    onSaveOfflineDraft = { title, muni, addr, budget ->
                        currentScreen = "catalog"
                    }
                )
                "orders" -> OrdersScreen(
                    orders = mockOrders,
                    onConfirmReceipt = { orderId ->
                        val index = mockOrders.indexOfFirst { it.id == orderId }
                        if (index != -1) {
                            val curr = mockOrders[index]
                            mockOrders[index] = curr.copy(status = OrderStatus.RECEIVED)
                        }
                    }
                )
            }
        }
    }
}
