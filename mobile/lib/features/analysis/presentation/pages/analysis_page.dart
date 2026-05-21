import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:cupid_ai/core/theme/app_theme.dart';
import 'package:cupid_ai/core/utils/validators.dart';
import 'package:cupid_ai/core/widgets/index.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_bloc.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_event.dart';
import 'package:cupid_ai/features/analysis/presentation/bloc/analysis_state.dart';
import 'package:cupid_ai/features/analysis/presentation/widgets/response_suggestions_list.dart';

class AnalysisPage extends StatefulWidget {
  const AnalysisPage({super.key});

  @override
  State<AnalysisPage> createState() => _AnalysisPageState();
}

class _AnalysisPageState extends State<AnalysisPage> {
  final _formKey = GlobalKey<FormState>();
  final _textCtrl = TextEditingController();

  @override
  void dispose() {
    _textCtrl.dispose();
    super.dispose();
  }

  void _submit() {
    if (!_formKey.currentState!.validate()) return;
    context
        .read<AnalysisBloc>()
        .add(AnalysisSubmitted(_textCtrl.text.trim()));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration:
            const BoxDecoration(gradient: AppTheme.backgroundGradient),
        child: SafeArea(
          child: BlocConsumer<AnalysisBloc, AnalysisState>(
            listener: (context, state) {
              if (state is AnalysisFailure) {
                AppSnackBar.error(context, state.message);
              }
            },
            builder: (context, state) {
              if (state is AnalysisSuccess) {
                return _ResultView(
                  result: state,
                  onReset: () =>
                      context.read<AnalysisBloc>().add(const AnalysisReset()),
                );
              }
              return _InputView(
                formKey: _formKey,
                controller: _textCtrl,
                onSubmit: _submit,
                isLoading: state is AnalysisLoading,
              );
            },
          ),
        ),
      ),
    );
  }
}

class _InputView extends StatelessWidget {
  const _InputView({
    required this.formKey,
    required this.controller,
    required this.onSubmit,
    required this.isLoading,
  });

  final GlobalKey<FormState> formKey;
  final TextEditingController controller;
  final VoidCallback onSubmit;
  final bool isLoading;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(24),
      child: Form(
        key: formKey,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            _buildTitle(),
            const SizedBox(height: 32),
            _buildInputCard(context),
            const SizedBox(height: 24),
            _buildTips(),
            const SizedBox(height: 32),
            AppButton(
              label: isLoading ? 'Analyzing...' : 'Generate Responses',
              onPressed: isLoading ? null : onSubmit,
              isLoading: isLoading,
            ),
            const SizedBox(height: 96), // clear floating nav bar
          ],
        ),
      ),
    );
  }

  Widget _buildTitle() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Analyze Conversation',
            style: AppTheme.headlineMedium),
        const SizedBox(height: 6),
        Text(
          'Paste a conversation and get 5 witty response suggestions',
          style: AppTheme.bodyTextStyle
              .copyWith(color: AppTheme.textSecondaryColor),
        ),
      ],
    );
  }

  Widget _buildInputCard(BuildContext context) {
    return AppCard(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.chat_bubble_outline_rounded,
                  color: AppTheme.primaryColor, size: 20),
              const SizedBox(width: 8),
              Text('Conversation', style: AppTheme.labelTextStyle),
            ],
          ),
          const SizedBox(height: 16),
          TextFormField(
            controller: controller,
            maxLines: 10,
            minLines: 6,
            validator: Validators.conversationText,
            style: AppTheme.bodyTextStyle,
            decoration: const InputDecoration(
              hintText:
                  'Paste the conversation here...\n\nExample:\nThem: Hey! How was your weekend?\nYou: It was great! Went hiking.',
              border: InputBorder.none,
              enabledBorder: InputBorder.none,
              focusedBorder: InputBorder.none,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildTips() {
    return AppCard(
      padding: const EdgeInsets.all(16),
      color: AppTheme.primaryColor.withValues(alpha: 0.05),
      borderColor: AppTheme.primaryColor.withValues(alpha: 0.2),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.lightbulb_outline_rounded,
                  color: AppTheme.accentColor, size: 18),
              const SizedBox(width: 8),
              Text('Tips', style: AppTheme.labelTextStyle),
            ],
          ),
          const SizedBox(height: 12),
          ...[
            'Include the full conversation for better context',
            'Label each message (e.g. "Them:" / "You:")',
            'More context = better response suggestions',
          ].map((tip) => Padding(
                padding: const EdgeInsets.only(bottom: 6),
                child: Row(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('• ',
                        style: TextStyle(color: AppTheme.primaryColor)),
                    Expanded(
                      child: Text(tip,
                          style: AppTheme.captionTextStyle
                              .copyWith(fontSize: 13)),
                    ),
                  ],
                ),
              )),
        ],
      ),
    );
  }
}

class _ResultView extends StatelessWidget {
  const _ResultView({required this.result, required this.onReset});

  final AnalysisSuccess result;
  final VoidCallback onReset;

  @override
  Widget build(BuildContext context) {
    return CustomScrollView(
      slivers: [
        SliverToBoxAdapter(
          child: Padding(
            padding:
                const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text('Response Suggestions',
                          style: AppTheme.headlineMedium),
                    ),
                    AppIconButton(
                      icon: Icons.refresh_rounded,
                      onPressed: onReset,
                      tooltip: 'New analysis',
                    ),
                  ],
                ),
                const SizedBox(height: 6),
                _SentimentChip(sentiment: result.result.sentiment),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
        SliverPadding(
          padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
          sliver: ResponseSuggestionsList(
              suggestions: result.result.suggestions),
        ),
      ],
    );
  }
}

class _SentimentChip extends StatelessWidget {
  const _SentimentChip({required this.sentiment});
  final String sentiment;

  @override
  Widget build(BuildContext context) {
    final (color, icon, label) = switch (sentiment) {
      'positive' => (AppTheme.successColor, Icons.sentiment_satisfied_rounded,
          'Positive vibe'),
      'negative' => (AppTheme.errorColor, Icons.sentiment_dissatisfied_rounded,
          'Needs warmth'),
      _ => (AppTheme.infoColor, Icons.sentiment_neutral_rounded, 'Neutral'),
    };

    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: color.withValues(alpha: 0.3)),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: color, size: 16),
          const SizedBox(width: 6),
          Text(label,
              style: TextStyle(
                  color: color,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  fontFamily: 'Poppins')),
        ],
      ),
    );
  }
}
