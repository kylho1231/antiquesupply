package com.antiquesupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.CheckCircle
import androidx.compose.material.icons.filled.LocalShipping
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antiquesupply.app.data.model.OrderStatus
import com.antiquesupply.app.data.model.PurchaseOrderDto
import com.antiquesupply.app.ui.theme.ForestGreen
import com.antiquesupply.app.ui.theme.WarmAmber

@Composable
fun OrdersScreen(
    orders: List<PurchaseOrderDto>,
    onConfirmReceipt: (orderId: String) -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        Text(
            text = "Commercial Purchase Orders",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )
        Text(
            text = "Track dispatch schedules, freight logistics, and arrival confirmations.",
            fontSize = 12.sp,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(16.dp))

        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(orders) { order ->
                OrderCard(order = order, onConfirmReceipt = { onConfirmReceipt(order.id) })
            }
        }
    }
}

@Composable
fun OrderCard(
    order: PurchaseOrderDto,
    onConfirmReceipt: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(
                    text = order.poNumber,
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    color = ForestGreen
                )

                val statusColor = when (order.status) {
                    OrderStatus.RECEIVED -> Color(0xFF2E7D32)
                    OrderStatus.DISPATCHED -> WarmAmber
                    OrderStatus.CONFIRMED -> Color(0xFF1565C0)
                    else -> Color.Gray
                }

                Surface(
                    color = statusColor.copy(alpha = 0.15f),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Text(
                        text = order.status.name.replace("_", " "),
                        color = statusColor,
                        fontWeight = FontWeight.Bold,
                        fontSize = 10.sp,
                        modifier = Modifier.padding(horizontal = 8.dp, vertical = 3.dp)
                    )
                }
            }

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = order.supplierName,
                fontWeight = FontWeight.Bold,
                fontSize = 14.sp
            )
            Text(
                text = "Destination: ${order.deliveryMunicipality}, ${order.deliveryProvince}",
                fontSize = 12.sp,
                color = Color.Gray
            )

            Spacer(modifier = Modifier.height(10.dp))

            // Items Summary
            order.items.forEach { item ->
                Row(
                    horizontalArrangement = Arrangement.SpaceBetween,
                    modifier = Modifier.fillMaxWidth().padding(vertical = 2.dp)
                ) {
                    Text(text = "${item.quantity.toInt()}x ${item.itemTitle}", fontSize = 12.sp)
                    Text(
                        text = "₱${"%,.2f".format(item.lineTotal)}",
                        fontWeight = FontWeight.SemiBold,
                        fontSize = 12.sp
                    )
                }
            }

            Spacer(modifier = Modifier.height(8.dp))
            Divider(color = Color(0xFFEEEEEE))
            Spacer(modifier = Modifier.height(8.dp))

            Row(
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text(text = "Grand Total:", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                Text(
                    text = "₱${"%,.2f".format(order.grandTotal)}",
                    fontWeight = FontWeight.Black,
                    fontSize = 15.sp,
                    color = ForestGreen
                )
            }

            if (order.status == OrderStatus.DELIVERED) {
                Spacer(modifier = Modifier.height(12.dp))
                Button(
                    onClick = onConfirmReceipt,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreen),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Icon(Icons.Default.CheckCircle, contentDescription = null, tint = WarmAmber)
                    Spacer(modifier = Modifier.width(6.dp))
                    Text("Confirm Receipt of Goods", fontWeight = FontWeight.Bold, fontSize = 12.sp)
                }
            }
        }
    }
}
