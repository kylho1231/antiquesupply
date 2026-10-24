package com.antiquesupply.app.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

val ForestGreen = Color(0xFF0F5132)
val ForestGreenDark = Color(0xFF0A3B24)
val ForestGreenLight = Color(0xFFE8F5E9)

val WarmAmber = Color(0xFFF4B942)
val WarmAmberDark = Color(0xFFD99B22)

val DarkSlate = Color(0xFF17252A)
val SoftIvory = Color(0xFFF8FAF7)

private val LightColorScheme = lightColorScheme(
    primary = ForestGreen,
    onPrimary = Color.White,
    primaryContainer = ForestGreenLight,
    onPrimaryContainer = ForestGreenDark,
    secondary = WarmAmber,
    onSecondary = DarkSlate,
    secondaryContainer = Color(0xFFFFF8E1),
    background = SoftIvory,
    surface = Color.White,
    onSurface = DarkSlate,
    onBackground = DarkSlate
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFF81C784),
    onPrimary = Color(0xFF003314),
    primaryContainer = ForestGreenDark,
    secondary = WarmAmber,
    background = Color(0xFF121B1E),
    surface = DarkSlate,
    onSurface = Color.White,
    onBackground = Color.White
)

@Composable
fun AntiqueSupplyTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography(),
        content = content
    )
}
