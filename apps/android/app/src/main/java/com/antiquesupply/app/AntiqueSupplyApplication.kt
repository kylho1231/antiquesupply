package com.antiquesupply.app

import android.app.Application
import coil.ImageLoader
import coil.ImageLoaderFactory
import coil.disk.DiskCache
import coil.memory.MemoryCache

class AntiqueSupplyApplication : Application(), ImageLoaderFactory {
    override fun newImageLoader(): ImageLoader = ImageLoader.Builder(this)
        .memoryCache { MemoryCache.Builder(this).maxSizePercent(0.20).build() }
        .diskCache { DiskCache.Builder().directory(cacheDir.resolve("product_photos")).maxSizeBytes(64L * 1024 * 1024).build() }
        .respectCacheHeaders(true)
        .crossfade(180)
        .build()
}
