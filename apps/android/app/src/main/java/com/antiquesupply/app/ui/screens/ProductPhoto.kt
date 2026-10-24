package com.antiquesupply.app.ui.screens

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import coil.compose.AsyncImage
import coil.request.CachePolicy
import coil.request.ImageRequest
import org.json.JSONArray

@Composable
fun ProductPhoto(source: String?, description: String, isDemo: Boolean, modifier: Modifier = Modifier) {
    val context = LocalContext.current
    val localEditorial = source?.startsWith("file:///android_asset/images/editorial/") == true
    val safeSource = source?.takeIf { (localEditorial && isDemo) || it.startsWith("https://") }
    var loading by remember(safeSource) { mutableStateOf(safeSource != null) }
    var failed by remember(safeSource) { mutableStateOf(safeSource == null) }
    var offlineAttempt by remember(safeSource) { mutableStateOf(false) }
    val credit = remember(source) {
        if (!localEditorial) null else runCatching {
            val entries = JSONArray(context.assets.open("image-manifest.json").bufferedReader().use { it.readText() })
            (0 until entries.length()).map { entries.getJSONObject(it) }.firstOrNull { it.getString("androidPath") == source }
        }.getOrNull()
    }
    val request = remember(safeSource, offlineAttempt) {
        ImageRequest.Builder(context).data(safeSource)
            .memoryCachePolicy(CachePolicy.ENABLED).diskCachePolicy(CachePolicy.ENABLED)
            .networkCachePolicy(if (offlineAttempt) CachePolicy.DISABLED else CachePolicy.ENABLED)
            .crossfade(true).build()
    }
    Box(modifier.background(Color(0xFFEEE9DF))) {
        if (safeSource != null) AsyncImage(
            model = request, contentDescription = credit?.optString("alt") ?: description,
            contentScale = ContentScale.Fit, modifier = Modifier.fillMaxSize().padding(8.dp),
            onLoading = { loading = true }, onSuccess = { loading = false; failed = false },
            onError = {
                if (!offlineAttempt && !localEditorial) offlineAttempt = true
                else { loading = false; failed = true }
            }
        )
        if (loading) CircularProgressIndicator(Modifier.size(24.dp).align(Alignment.Center), strokeWidth = 2.dp)
        if (failed) Text("Supplier photo unavailable", modifier = Modifier.align(Alignment.Center).padding(16.dp), fontSize = 12.sp)
        if (isDemo || credit != null) Column(Modifier.align(Alignment.BottomStart).fillMaxWidth().background(Color(0xE617252A)).padding(8.dp)) {
            Text("Sample listing · illustrative photo", color = Color.White, fontSize = 10.sp)
            if (credit != null) Text("${credit.optString("creator")} · ${credit.optString("license")} · resized WebP", color = Color.White, fontSize = 9.sp,
                modifier = Modifier.clickable { context.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(credit.getString("sourceUrl")))) })
        }
    }
}
