package dev.getjanus.rono.ui.exam

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.FlowRow
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Scaffold
import androidx.compose.material3.Text
import androidx.compose.material3.TopAppBar
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.filled.ArrowBack
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import dev.getjanus.rono.R
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.components.PrimaryButton
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.ui.navigation.ExamRoute

private val examTypes = listOf(
    "USMLE Step 1" to "usmle_step1",
    "USMLE Step 2" to "usmle_step2",
    "USMLE Step 3" to "usmle_step3",
    "TUS" to "tus",
)
private val examParts = listOf(
    "Basic sciences" to "basic_sciences",
    "Clinical sciences" to "clinical_sciences",
)
private val countChoices = listOf(20, 40, 100)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ExamSetupScreen(
    onBack: () -> Unit,
    onStart: (ExamRoute) -> Unit,
) {
    var examType by remember { mutableStateOf<String?>(null) }
    var examPart by remember { mutableStateOf<String?>(null) }
    var count by remember { mutableStateOf(40) }
    var instant by remember { mutableStateOf(false) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text(stringResource(R.string.exam_setup_title)) },
                navigationIcon = {
                    IconButton(onClick = onBack) { Icon(Icons.AutoMirrored.Filled.ArrowBack, contentDescription = stringResource(R.string.common_back)) }
                },
            )
        },
    ) { padding ->
        Column(
            Modifier.fillMaxSize().padding(padding).verticalScroll(rememberScrollState()).padding(horizontal = Spacing.screen),
            verticalArrangement = Arrangement.spacedBy(Spacing.md),
        ) {
            Spacer(Modifier.height(Spacing.sm))
            ChoiceGroup(stringResource(R.string.exam_type), examTypes, examType, allowAny = true) { examType = it }
            ChoiceGroup(stringResource(R.string.exam_part), examParts, examPart, allowAny = true) { examPart = it }
            CountGroup(count) { count = it }
            FeedbackGroup(instant) { instant = it }
            Spacer(Modifier.height(Spacing.md))
            PrimaryButton(
                text = stringResource(R.string.exam_start),
                onClick = { onStart(ExamRoute(examType = examType, examPart = examPart, count = count, instantFeedback = instant)) },
            )
            Spacer(Modifier.height(Spacing.lg))
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ChoiceGroup(
    title: String,
    options: List<Pair<String, String>>,
    selected: String?,
    allowAny: Boolean,
    onSelect: (String?) -> Unit,
) {
    Column {
        Eyebrow(title)
        Spacer(Modifier.height(Spacing.sm))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm), verticalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            if (allowAny) {
                FilterChip(selected = selected == null, onClick = { onSelect(null) }, label = { Text(stringResource(R.string.exam_any)) })
            }
            options.forEach { (label, value) ->
                FilterChip(selected = selected == value, onClick = { onSelect(value) }, label = { Text(label) })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CountGroup(count: Int, onSelect: (Int) -> Unit) {
    Column {
        Eyebrow(stringResource(R.string.exam_count))
        Spacer(Modifier.height(Spacing.sm))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            countChoices.forEach { n ->
                FilterChip(selected = count == n, onClick = { onSelect(n) }, label = { Text("$n") })
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun FeedbackGroup(instant: Boolean, onSelect: (Boolean) -> Unit) {
    Column {
        Eyebrow(stringResource(R.string.exam_feedback_mode))
        Spacer(Modifier.height(Spacing.sm))
        FlowRow(horizontalArrangement = Arrangement.spacedBy(Spacing.sm)) {
            FilterChip(selected = !instant, onClick = { onSelect(false) }, label = { Text(stringResource(R.string.exam_real)) })
            FilterChip(selected = instant, onClick = { onSelect(true) }, label = { Text(stringResource(R.string.exam_instant)) })
        }
    }
}
