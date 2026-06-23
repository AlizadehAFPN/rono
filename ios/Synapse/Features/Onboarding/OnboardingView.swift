import SwiftUI

struct OnboardingView: View {
    @Environment(AuthStore.self) private var auth
    @Environment(LocaleStore.self) private var loc
    @State private var page = 0

    private var slides: [OnboardingStrings.Slide] { loc.t.onboarding.slides }
    private var isLast: Bool { page >= slides.count - 1 }

    var body: some View {
        VStack(spacing: 0) {
            // Top bar: language toggle + skip
            HStack {
                LanguagePill()
                Spacer()
                Button(loc.t.onboarding.skip) { auth.completeOnboarding() }
                    .font(.subheadline.weight(.medium))
                    .foregroundStyle(Palette.mutedForeground)
            }
            .padding(.horizontal, Metric.pad)
            .padding(.top, Metric.padSm)

            TabView(selection: $page) {
                ForEach(slides) { slide in
                    SlideView(slide: slide).tag(slide.id)
                }
            }
            .tabViewStyle(.page(indexDisplayMode: .never))

            PageDots(count: slides.count, index: page)
                .padding(.bottom, Metric.padLg)

            PrimaryButton(title: isLast ? loc.t.onboarding.getStarted : loc.t.common.actions.next) {
                if isLast {
                    auth.completeOnboarding()
                } else {
                    withAnimation { page += 1 }
                }
            }
            .padding(.horizontal, Metric.pad)
            .padding(.bottom, Metric.padLg)
        }
        .screenBackground()
    }
}

private struct SlideView: View {
    let slide: OnboardingStrings.Slide
    @State private var appeared = false

    var body: some View {
        VStack(spacing: 28) {
            Spacer()
            ZStack {
                Circle()
                    .fill(Palette.primary.opacity(0.10))
                    .frame(width: 200, height: 200)
                Circle()
                    .fill(Palette.primary.opacity(0.14))
                    .frame(width: 140, height: 140)
                Image(systemName: slide.systemImage)
                    .font(.system(size: 60, weight: .regular))
                    .foregroundStyle(Palette.primary)
                    .symbolRenderingMode(.hierarchical)
            }
            .scaleEffect(appeared ? 1 : 0.85)
            .opacity(appeared ? 1 : 0)

            VStack(spacing: 14) {
                Text(slide.title)
                    .font(.system(.largeTitle, design: .default).weight(.bold))
                    .foregroundStyle(Palette.foreground)
                    .multilineTextAlignment(.center)
                Text(slide.subtitle)
                    .font(.body)
                    .foregroundStyle(Palette.mutedForeground)
                    .multilineTextAlignment(.center)
                    .lineSpacing(2)
            }
            .padding(.horizontal, 32)
            .opacity(appeared ? 1 : 0)
            .offset(y: appeared ? 0 : 12)
            Spacer()
            Spacer()
        }
        .frame(maxWidth: .infinity)
        .onAppear { withAnimation(.spring(duration: 0.6)) { appeared = true } }
    }
}

private struct PageDots: View {
    let count: Int
    let index: Int
    var body: some View {
        HStack(spacing: 8) {
            ForEach(0..<count, id: \.self) { i in
                Capsule()
                    .fill(i == index ? Palette.primary : Palette.border)
                    .frame(width: i == index ? 22 : 8, height: 8)
                    .animation(.spring(duration: 0.3), value: index)
            }
        }
    }
}

/// Compact language toggle (TR / EN), reused on auth screens too.
struct LanguagePill: View {
    @Environment(LocaleStore.self) private var loc
    var body: some View {
        Menu {
            ForEach(AppLocale.allCases, id: \.self) { l in
                Button {
                    loc.locale = l
                } label: {
                    HStack {
                        Text(l.native)
                        if loc.locale == l { Image(systemName: "checkmark") }
                    }
                }
            }
        } label: {
            HStack(spacing: 6) {
                Image(systemName: "globe")
                Text(loc.locale.short).font(.subheadline.weight(.semibold))
            }
            .foregroundStyle(Palette.foreground)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(Palette.secondary)
            .clipShape(Capsule())
        }
    }
}
