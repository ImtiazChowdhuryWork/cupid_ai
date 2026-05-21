import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/analysis/domain/entities/analysis_result.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_bloc.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_event.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_state.dart';
import 'package:intl/intl.dart';

class HistoryPage extends StatefulWidget {
  const HistoryPage({super.key});

  @override
  State<HistoryPage> createState() => _HistoryPageState();
}

class _HistoryPageState extends State<HistoryPage> {
  @override
  void initState() {
    super.initState();
    context.read<AnalysisBloc>().add(const HistoryLoadRequested());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration:
            const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _buildHeader(),
              Expanded(child: _buildContent()),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 16, 24, 8),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('History', style: AppTheme.headlineMedium),
          Text('Your past conversations',
              style: AppTheme.bodyTextStyle
                  .copyWith(color: AppTheme.textSecondaryColor)),
        ],
      ),
    );
  }

  Widget _buildContent() {
    return BlocBuilder<AnalysisBloc, AnalysisState>(
      builder: (context, state) {
        if (state is HistoryLoading) {
          return ListView.separated(
            padding: const EdgeInsets.all(24),
            itemCount: 5,
            separatorBuilder: (context, i) => const SizedBox(height: 12),
            itemBuilder: (context, i) => const ResponseCardSkeleton(),
          );
        }

        if (state is HistoryFailure) {
          return Center(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Icon(Icons.error_outline,
                    color: AppTheme.errorColor, size: 48),
                const SizedBox(height: 16),
                Text(state.message, style: AppTheme.bodyTextStyle),
                const SizedBox(height: 16),
                AppButton(
                  label: 'Retry',
                  onPressed: () => context
                      .read<AnalysisBloc>()
                      .add(const HistoryLoadRequested()),
                  width: 120,
                ),
              ],
            ),
          );
        }

        if (state is HistoryLoaded) {
          if (state.results.isEmpty) return _buildEmpty();
          return ListView.separated(
            padding: const EdgeInsets.fromLTRB(24, 24, 24, 96),
            itemCount: state.results.length,
            separatorBuilder: (context, i) => const SizedBox(height: 12),
            itemBuilder: (context, index) =>
                _HistoryCard(result: state.results[index]),
          );
        }

        return _buildEmpty();
      },
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.history_rounded,
              color: AppTheme.textHint, size: 64),
          const SizedBox(height: 16),
          Text('No analyses yet',
              style: AppTheme.headlineSmall
                  .copyWith(color: AppTheme.textSecondaryColor)),
          const SizedBox(height: 8),
          Text('Start analyzing a conversation!',
              style: AppTheme.bodyTextStyle
                  .copyWith(color: AppTheme.textHint)),
        ],
      ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  const _HistoryCard({required this.result});

  final AnalysisResult result;

  @override
  Widget build(BuildContext context) {
    return AppCard(
      onTap: () => _showDetail(context),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                DateFormat('MMM d, yyyy · h:mm a').format(result.createdAt),
                style: AppTheme.captionTextStyle,
              ),
              Text(
                '${result.suggestions.length} responses',
                style: AppTheme.captionTextStyle.copyWith(
                    color: AppTheme.primaryColor,
                    fontWeight: FontWeight.w600),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            result.conversationText,
            style: AppTheme.bodyTextStyle,
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 6,
            children: result.suggestions
                .take(3)
                .map((s) => _ModePill(mode: s.mode))
                .toList(),
          ),
        ],
      ),
    );
  }

  void _showDetail(BuildContext context) {
    AppBottomSheet.show(
      context,
      title: 'Response Suggestions',
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: result.suggestions.length,
        separatorBuilder: (context, i) => const SizedBox(height: 12),
        itemBuilder: (_, i) {
          final s = result.suggestions[i];
          return ResponseCard(
            mode: s.mode,
            text: s.text,
            confidence: s.confidence,
          );
        },
      ),
    );
  }
}

class _ModePill extends StatelessWidget {
  const _ModePill({required this.mode});
  final String mode;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: AppTheme.secondaryColor.withValues(alpha: 0.3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        mode,
        style: const TextStyle(
          fontSize: 11,
          color: AppTheme.primaryDark,
          fontWeight: FontWeight.w500,
          fontFamily: 'Poppins',
        ),
      ),
    );
  }
}
