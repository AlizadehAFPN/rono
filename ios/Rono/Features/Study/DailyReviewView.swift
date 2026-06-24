import SwiftUI

struct DailyReviewView: View {
    @Environment(LocaleStore.self) private var loc

    @State private var collections: [CategoryCardOut] = []
    @State private var selected: Set<String> = []
    @State private var byTime = false
    @State private var count = 20
    @State private var minutes = 15
    @State private var level: String? = nil
    @State private var loading = true
    @State private var starting = false
    @State private var session: PracticeSessionOut?

    private var s: StudyStrings.Daily { loc.t.study.daily }
    private let counts = [10, 20, 30, 50]
    private let times = [5, 10, 15, 20, 30]
    private let levels = ["beginner", "developing", "proficient", "advanced"]

    private var allSelected: Bool { selected.count == collections.count && !collections.isEmpty }
    private var totalDue: Int { collections.filter { selected.contains($0.topicId) }.reduce(0) { $0 + $1.dueCount } }

    var body: some View {
        Group {
        if loading && collections.isEmpty {
            ScrollView { DailyReviewSkeleton() }
        } else {
        Form {
            // Collections
            Section {
                ForEach(collections) { c in
                    Button {
                        Haptics.select()
                        if selected.contains(c.topicId) { selected.remove(c.topicId) }
                        else { selected.insert(c.topicId) }
                    } label: {
                        HStack {
                            Image(systemName: selected.contains(c.topicId) ? "checkmark.circle.fill" : "circle")
                                .foregroundStyle(selected.contains(c.topicId) ? Palette.primary : Palette.mutedForeground)
                            Text(c.topicName).foregroundStyle(Palette.foreground)
                            Spacer()
                            if c.dueCount > 0 {
                                Pill(text: s.dueCount(c.dueCount), color: Palette.studyWarning)
                            }
                        }
                    }
                }
            } header: {
                HStack {
                    Text(s.collections)
                    Spacer()
                    Button(allSelected ? s.clear : s.selectAll) {
                        Haptics.tap()
                        selected = allSelected ? [] : Set(collections.map(\.topicId))
                    }
                    .font(.caption.weight(.semibold))
                }
            } footer: {
                Text(s.collectionsHint)
            }

            // Budget
            Section(s.budget) {
                Picker("", selection: $byTime) {
                    Text(s.byCount).tag(false)
                    Text(s.byTime).tag(true)
                }
                .pickerStyle(.segmented)

                if byTime {
                    Picker(s.length, selection: $minutes) {
                        ForEach(times, id: \.self) { Text(s.minutesOpt($0)).tag($0) }
                    }
                } else {
                    Picker(s.length, selection: $count) {
                        ForEach(counts, id: \.self) { Text(s.questionsOpt($0)).tag($0) }
                    }
                }
            }

            // Self-rated level (cold start)
            Section {
                Picker(s.level, selection: $level) {
                    Text(s.levelSkip).tag(String?.none)
                    ForEach(levels, id: \.self) { lv in
                        Text(s.levels[lv] ?? lv).tag(String?.some(lv))
                    }
                }
            } footer: {
                Text(s.levelHint)
            }

            Section {
                Button {
                    Task { await start() }
                } label: {
                    HStack {
                        if starting { ProgressView() }
                        Text(starting ? s.starting : s.start).fontWeight(.semibold)
                        Spacer()
                        Text(byTime ? s.summaryTime(minutes) : s.summaryCount(count))
                            .foregroundStyle(Palette.mutedForeground)
                    }
                }
                .disabled(starting || selected.isEmpty)
            } footer: {
                if selected.isEmpty { Text(s.none).foregroundStyle(Palette.destructive) }
            }
        }
        }
        }
        .navigationTitle(s.formTitle)
        .navigationBarTitleDisplayMode(.inline)
        .listRowBackground(Palette.card)
        .ronoScreen()
        .screenContentTop()
        .task { await load() }
        .fullScreenCover(item: $session) { sess in
            SessionView(session: sess).environment(loc)
        }
    }

    private func load() async {
        loading = true; defer { loading = false }
        if let cats = try? await ProgressAPI.categories().categories {
            collections = cats
            selected = Set(cats.map(\.topicId)) // all by default
        }
    }

    private func start() async {
        starting = true; defer { starting = false }
        let topicIds = allSelected ? nil : Array(selected)
        do {
            let sess = try await PracticeAPI.start(.init(
                sessionType: "daily_review",
                topicIds: topicIds,
                itemsTarget: byTime ? nil : count,
                limitType: byTime ? "time" : "count",
                timeLimitMinutes: byTime ? minutes : nil,
                selfRatedLevel: level
            ))
            Haptics.tap()
            session = sess
        } catch { Haptics.error() }
    }
}
