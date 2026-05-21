import 'package:flutter/material.dart';
import 'package:cupid_ai/core/widgets/text_fields/app_text_field.dart';
import 'package:cupid_ai/core/utils/validators.dart';

class AppEmailField extends StatelessWidget {
  const AppEmailField({
    super.key,
    required this.onChanged,
    this.controller,
    this.focusNode,
    this.textInputAction,
    this.onFieldSubmitted,
  });

  final Function(String) onChanged;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final TextInputAction? textInputAction;
  final Function(String)? onFieldSubmitted;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      label: 'Email',
      hint: 'Enter your email',
      icon: Icons.email_outlined,
      textInputType: TextInputType.emailAddress,
      textInputAction: textInputAction ?? TextInputAction.next,
      controller: controller,
      focusNode: focusNode,
      onChanged: onChanged,
      onFieldSubmitted: onFieldSubmitted,
      validator: Validators.email,
    );
  }
}
