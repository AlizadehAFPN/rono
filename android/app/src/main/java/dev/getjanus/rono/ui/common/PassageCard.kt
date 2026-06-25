package dev.getjanus.rono.ui.common

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.unit.dp
import dev.getjanus.rono.R
import dev.getjanus.rono.core.designsystem.components.AppCard
import dev.getjanus.rono.core.designsystem.components.Eyebrow
import dev.getjanus.rono.core.designsystem.theme.Spacing
import dev.getjanus.rono.core.util.rememberHtmlText
import dev.getjanus.rono.data.practice.StimulusDto

/**
 * A shared reading passage / scenario (متن مشترک) shown above a question. The
 * full passage travels with each question of its group, so the learner can
 * re-read it at any time. Long passages scroll inside the card so they never
 * push the question off-screen.
 *
 * [imageUrl] must already be absolute — resolve [StimulusDto.imageUrl] via
 * MediaUrlResolver in the ViewModel before passing it here.
 */
@Composable
fun PassageCard(
    stimulus: StimulusDto,
    imageUrl: String?,
    modifier: Modifier = Modifier,
) {
    val label = stringResource(R.string.passage_label) + (stimulus.groupNo?.let { " $it" } ?: "")
    AppCard(modifier = modifier.fillMaxWidth()) {
        Eyebrow(label)
        Spacer(Modifier.height(Spacing.sm))
        // Cap the passage height and scroll it internally for long texts.
        Text(
            rememberHtmlText(stimulus.content),
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.heightIn(max = 320.dp).verticalScroll(rememberScrollState()),
        )
        QuestionImage(imageUrl)
    }
}
