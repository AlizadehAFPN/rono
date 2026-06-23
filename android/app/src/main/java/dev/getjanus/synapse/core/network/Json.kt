package dev.getjanus.synapse.core.network

import kotlinx.serialization.ExperimentalSerializationApi
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonNamingStrategy

/**
 * Shared JSON config. Snake-case naming strategy lets DTO properties stay
 * idiomatic camelCase while matching the FastAPI snake_case wire format, so we
 * only need @SerialName for the handful of irregular fields.
 */
@OptIn(ExperimentalSerializationApi::class)
val SynapseJson: Json = Json {
    ignoreUnknownKeys = true
    explicitNulls = false
    coerceInputValues = true
    namingStrategy = JsonNamingStrategy.SnakeCase
}
