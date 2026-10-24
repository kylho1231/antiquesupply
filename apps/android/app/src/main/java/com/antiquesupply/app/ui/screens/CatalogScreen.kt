package com.antiquesupply.app.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Search
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import com.antiquesupply.app.data.model.ANTIQUE_MUNICIPALITIES
import com.antiquesupply.app.data.model.ProductDto
import com.antiquesupply.app.ui.theme.ForestGreen
import com.antiquesupply.app.ui.theme.WarmAmber

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun CatalogScreen(
    products: List<ProductDto>,
    onProductClick: (ProductDto) -> Unit,
    onRequestQuote: (ProductDto) -> Unit
) {
    var searchQuery by remember { mutableStateOf("") }
    var selectedMunicipality by remember { mutableStateOf<String?>(null) }

    val filteredProducts = products.filter {
        val matchesQuery = searchQuery.isBlank() ||
                it.name.contains(searchQuery, ignoreCase = true) ||
                it.description.contains(searchQuery, ignoreCase = true)
        val matchesMuni = selectedMunicipality == null || it.originMunicipality == selectedMunicipality
        matchesQuery && matchesMuni
    }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(16.dp)
    ) {
        // Search Input
        OutlinedTextField(
            value = searchQuery,
            onValueChange = { searchQuery = it },
            placeholder = { Text("Search Antique products, sugar, patadyong...", fontSize = 13.sp) },
            leadingIcon = { Icon(Icons.Default.Search, contentDescription = null, tint = ForestGreen) },
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            singleLine = true,
            colors = TextFieldDefaults.outlinedTextFieldColors(
                focusedBorderColor = ForestGreen,
                unfocusedBorderColor = Color(0xFFD0D7D3)
            )
        )

        Spacer(modifier = Modifier.height(12.dp))

        // Municipality Filter Chips
        LazyRow(
            horizontalArrangement = Arrangement.spacedBy(8.dp),
            modifier = Modifier.fillMaxWidth()
        ) {
            item {
                FilterChip(
                    selected = selectedMunicipality == null,
                    onClick = { selectedMunicipality = null },
                    label = { Text("All Antique", fontSize = 12.sp) }
                )
            }
            items(ANTIQUE_MUNICIPALITIES) { muni ->
                FilterChip(
                    selected = selectedMunicipality == muni,
                    onClick = {
                        selectedMunicipality = if (selectedMunicipality == muni) null else muni
                    },
                    label = { Text(muni, fontSize = 12.sp) }
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Products Count
        Text(
            text = "${filteredProducts.size} Products Available",
            fontWeight = FontWeight.Bold,
            fontSize = 14.sp,
            color = MaterialTheme.colorScheme.onBackground
        )

        Spacer(modifier = Modifier.height(8.dp))

        // Product Grid
        LazyVerticalGrid(
            columns = GridCells.Fixed(2),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
            modifier = Modifier.fillMaxSize()
        ) {
            items(filteredProducts) { product ->
                ProductCard(
                    product = product,
                    onClick = { onProductClick(product) },
                    onRequestQuote = { onRequestQuote(product) }
                )
            }
        }
    }
}

@Composable
fun ProductCard(
    product: ProductDto,
    onClick: () -> Unit,
    onRequestQuote: () -> Unit
) {
    Card(
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(containerColor = Color.White),
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp),
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(modifier = Modifier.fillMaxWidth()) {
            // Product Image
            Box(modifier = Modifier.height(110.dp).fillMaxWidth()) {
                AsyncImage(
                    model = product.imageUrls.firstOrNull() ?: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600",
                    contentDescription = product.name,
                    contentScale = ContentScale.Crop,
                    modifier = Modifier.fillMaxSize()
                )
                // Municipality badge
                Surface(
                    color = Color(0xCC17252A),
                    shape = RoundedCornerShape(bottomEnd = 8.dp),
                    modifier = Modifier.align(Alignment.TopStart)
                ) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.padding(horizontal = 6.dp, vertical = 2.dp)
                    ) {
                        Icon(
                            Icons.Default.LocationOn,
                            contentDescription = null,
                            tint = WarmAmber,
                            modifier = Modifier.size(10.dp)
                        )
                        Spacer(modifier = Modifier.width(2.dp))
                        Text(
                            text = product.originMunicipality,
                            fontSize = 9.sp,
                            color = Color.White,
                            fontWeight = FontWeight.Bold
                        )
                    }
                }
            }

            // Info
            Column(modifier = Modifier.padding(10.dp)) {
                Text(
                    text = product.name,
                    fontWeight = FontWeight.Bold,
                    fontSize = 12.sp,
                    maxLines = 2,
                    overflow = TextOverflow.Ellipsis,
                    lineHeight = 16.sp
                )

                Spacer(modifier = Modifier.height(4.dp))

                Text(
                    text = "₱${"%,.2f".format(product.basePrice)} / ${product.unit}",
                    fontWeight = FontWeight.ExtraBold,
                    fontSize = 13.sp,
                    color = ForestGreen
                )

                Text(
                    text = "MOQ: ${product.minOrderQuantity} ${product.unit}s",
                    fontSize = 10.sp,
                    color = Color.Gray
                )

                Spacer(modifier = Modifier.height(8.dp))

                Button(
                    onClick = onRequestQuote,
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = ForestGreen),
                    contentPadding = PaddingValues(vertical = 4.dp, horizontal = 8.dp),
                    modifier = Modifier.fillMaxWidth().height(32.dp)
                ) {
                    Text("Request Quote", fontSize = 11.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}
