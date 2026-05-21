import 'package:flutter/material.dart';
import 'package:cupid_ai/core/widgets/text_fields/app_text_field.dart';
import 'package:cupid_ai/core/utils/validators.dart';

class AppPasswordField extends StatelessWidget {
  const AppPasswordField({
    super.key,
    required this.onChanged,
    this.controller,
    this.focusNode,
    this.label = 'Password',
    this.hint = 'Enter your password',
    this.textInputAction,
    this.onFieldSubmitted,
    this.validator,
  });

  final Function(String) onChanged;
  final TextEditingController? controller;
  final FocusNode? focusNode;
  final String label;
  final String hint;
  final TextInputAction? textInputAction;
  final Function(String)? onFieldSubmitted;
  final String? Function(String?)? validator;

  @override
  Widget build(BuildContext context) {
    return AppTextField(
      label: label,
      hint: hint,
      icon: Icons.lock_outline,
      isPassword: true,
      textInputAction: textInputAction ?? TextInputAction.done,
      controller: controller,
      focusNode: focusNode,
      onChanged: onChanged,
      onFieldSubmitted: onFieldSubmitted,
      validator: validator ?? Validators.password,
    );
  }
}
