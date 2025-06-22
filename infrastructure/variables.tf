variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "cognito-sample"
}

variable "environment" {
  description = "Environment"
  type        = string
  default     = "dev"
}

variable "callback_urls" {
  description = "Callback URLs for the Cognito app client"
  type        = list(string)
  default     = ["http://localhost:3000/auth/callback"]
}

variable "logout_urls" {
  description = "Logout URLs for the Cognito app client"
  type        = list(string)
  default     = ["http://localhost:3000/auth/logout"]
}

# External Identity Providers
variable "google_client_id" {
  description = "Google OAuth client ID"
  type        = string
  default     = ""
}

variable "google_client_secret" {
  description = "Google OAuth client secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "microsoft_client_id" {
  description = "Microsoft OAuth client ID"
  type        = string
  default     = ""
}

variable "microsoft_client_secret" {
  description = "Microsoft OAuth client secret"
  type        = string
  default     = ""
  sensitive   = true
}

variable "enable_external_providers" {
  description = "Enable external identity providers"
  type        = bool
  default     = false
}