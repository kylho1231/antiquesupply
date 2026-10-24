package com.antiquesupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Send
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.antiquesupply.app.data.model.ANTIQUE_MUNICIPALITIES
import com.antiquesupply.app.data.model.RfqItemDto
import com.antiquesupply.app.ui.theme.ForestGreen
import com.antiquesupply.app.ui.theme.WarmAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CreateRfqScreen(
    initialTitle: String = "",
    onSubmit: (title: String, municipality: String, address: String, budget: Double) -> Unit,
    onSaveOfflineDraft: (title: String, municipality: String, address: String, budget: Double) -> Unit
) {
    var title by remember { mutableStateOf(initialTitle.ifBlank { "Wholesale Sugar & Provisions Sourcing" }) }
    var selectedMunicipality by remember { mutableStateOf(ANTIQUE_MUNICIPALITIES.first()) }
    var deliveryAddress by remember { mutableStateOf("Port Receiving Area / Main Warehouse") }
    var targetBudget by remember { mutableStateOf("45000") }
    var itemTitle by remember { mutableStateOf("Organic Muscovado Sugar (50kg)") }
    var quantity by remember { mutableStateOf("10") }
    var unit by remember { mutableStateOf("sack") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Create Request for Quotation",
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            color = ForestGreen
        )
        Text(
            text = "Request competitive bids directly from certified Antique cooperatives.",
            fontSize = 12.sp,
            color = Color.Gray
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Title
        OutlinedTextField(
            value = title,
            onValueChange = { title = it },
            label = { Text("RFQ Project Title") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Destination
        OutlinedTextField(
            value = deliveryAddress,
            onValueChange = { deliveryAddress = it },
            label = { Text("Drop-off Delivery Address") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Target Budget
        OutlinedTextField(
            value = targetBudget,
            onValueChange = { targetBudget = it },
            label = { Text("Target Budget (PHP)") },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(10.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Line Item Card
        Card(
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(containerColor = Color.White),
            elevation = CardDefaults.cardElevation(defaultElevation = 1.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            Column(modifier = Modifier.padding(12.dp)) {
                Text(
                    text = "Procurement Item Specifications",
                    fontWeight = FontWeight.Bold,
                    fontSize = 13.sp,
                    color = MaterialTheme.colorScheme.onSurface
                )
                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = itemTitle,
                    onValueChange = { itemTitle = it },
                    label = { Text("Product / Commodity Name") },
                    modifier = Modifier.fillMaxWidth(),
                    shape = RoundedCornerShape(8.dp)
                )

                Spacer(modifier = Modifier.height(8.dp))

                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    OutlinedTextField(
                        value = quantity,
                        onValueChange = { quantity = it },
                        label = { Text("Qty") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    )
                    OutlinedTextField(
                        value = unit,
                        onValueChange = { unit = it },
                        label = { Text("Unit") },
                        modifier = Modifier.weight(1f),
                        shape = RoundedCornerShape(8.dp)
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        // Action Buttons
        Button(
            onClick = {
                onSubmit(
                    title,
                    selectedMunicipality,
                    deliveryAddress,
                    targetBudget.toDoubleOrNull() ?: 0.0
                )
            },
            shape = RoundedCornerShape(10.dp),
            colors = ButtonDefaults.buttonColors(containerColor = ForestGreen),
            modifier = Modifier.fillMaxWidth().height(48.dp)
        ) {
            Icon(Icons.Default.Send, contentDescription = null, tint = WarmAmber)
            Spacer(modifier = Modifier.width(8.dp))
            Text("Publish RFQ to Cooperatives", fontWeight = FontWeight.Bold, fontSize = 14.sp)
        }

        Spacer(modifier = Modifier.height(8.dp))

        OutlinedButton(
            onClick = {
                onSaveOfflineDraft(
                    title,
                    selectedMunicipality,
                    deliveryAddress,
                    targetBudget.toDoubleOrNull() ?: 0.0
                )
            },
            shape = RoundedCornerShape(10.dp),
            modifier = Modifier.fillMaxWidth().height(44.dp)
        ) {
            Text("Save as Offline Draft (No Signal)", fontSize = 13.sp, color = Color.DarkGray)
        }
    }
}
