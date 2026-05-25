package models

import "time"

type ChallengeType string

const (
	ChallengeAnalyzeCount ChallengeType = "analyze_count"
	ChallengeStreakAlive  ChallengeType = "streak_alive"
	ChallengeModeVariety  ChallengeType = "mode_variety"
)

type DailyChallenge struct {
	ID          string        `json:"id"`
	Type        ChallengeType `json:"type"`
	Title       string        `json:"title"`
	Description string        `json:"description"`
	Target      int           `json:"target"`
	Progress    int           `json:"progress"`
	Completed   bool          `json:"completed"`
	Reward      string        `json:"reward"`
	Date        time.Time     `json:"date"`
}

// challengeDefinitions rotates daily based on day-of-year
var challengeDefinitions = []struct {
	Type        ChallengeType
	Title       string
	Description string
	Target      int
	Reward      string
}{
	{ChallengeAnalyzeCount, "Analyze 3 Conversations", "Use Cupid AI 3 times today", 3, "+2 bonus analyses"},
	{ChallengeStreakAlive, "Keep Your Streak Alive", "Complete at least 1 analysis today", 1, "Streak protection"},
	{ChallengeModeVariety, "Try Every Style", "Use 3 different response modes", 3, "Style Master badge"},
	{ChallengeAnalyzeCount, "Power Analyzer", "Complete 5 analyses today", 5, "+5 bonus analyses"},
	{ChallengeStreakAlive, "Daily Habit", "Stay active — analyze a conversation", 1, "+1 streak day"},
	{ChallengeModeVariety, "Mix It Up", "Use both Witty and Sincere modes", 2, "Versatile badge"},
	{ChallengeAnalyzeCount, "Conversation Expert", "Analyze 2 conversations today", 2, "+1 bonus analysis"},
}

func GetTodaysChallengeDef() (ChallengeType, string, string, int, string) {
	dayOfYear := time.Now().YearDay()
	def := challengeDefinitions[dayOfYear%len(challengeDefinitions)]
	return def.Type, def.Title, def.Description, def.Target, def.Reward
}
