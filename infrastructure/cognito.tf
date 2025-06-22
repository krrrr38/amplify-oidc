# Local variables
locals {
  identity_providers = var.enable_external_providers ? concat(
    ["COGNITO"],
    var.google_client_id != "" ? ["Google"] : [],
    var.microsoft_client_id != "" ? ["Microsoft"] : []
  ) : ["COGNITO"]
}

resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-user-pool"

  # Password policy
  password_policy {
    minimum_length    = 8
    require_lowercase = true
    require_numbers   = true
    require_symbols   = true
    require_uppercase = true
  }

  # MFA configuration
  mfa_configuration = "OPTIONAL"
  software_token_mfa_configuration {
    enabled = true
  }
  
  # Device configuration for MFA skip
  device_configuration {
    challenge_required_on_new_device      = true
    device_only_remembered_on_user_prompt = false
  }

  # Account recovery
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }

  # User pool attributes
  alias_attributes         = ["email"]
  auto_verified_attributes = ["email"]

  # Email configuration
  email_configuration {
    email_sending_account = "COGNITO_DEFAULT"
  }

  # Schema
  schema {
    attribute_data_type = "String"
    name                = "email"
    required            = true
    mutable             = true
  }

  schema {
    attribute_data_type = "String"
    name                = "name"
    required            = true
    mutable             = true
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-user-pool"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cognito_user_pool_client" "main" {
  name         = "${var.project_name}-${var.environment}-client"
  user_pool_id = aws_cognito_user_pool.main.id

  # OAuth configuration
  allowed_oauth_flows                  = ["code"]
  allowed_oauth_scopes                 = ["email", "openid", "profile"]
  allowed_oauth_flows_user_pool_client = true
  supported_identity_providers         = local.identity_providers

  # Callback URLs
  callback_urls = var.callback_urls
  logout_urls   = var.logout_urls

  # Token validity
  access_token_validity  = 24
  id_token_validity      = 24
  refresh_token_validity = 30

  token_validity_units {
    access_token  = "hours"
    id_token      = "hours"
    refresh_token = "days"
  }

  # Client settings
  generate_secret     = false
  explicit_auth_flows = [
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH",
    "ALLOW_USER_PASSWORD_AUTH"
  ]

  # Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"
}

resource "aws_cognito_user_pool_domain" "main" {
  domain       = "${var.project_name}-${var.environment}-auth"
  user_pool_id = aws_cognito_user_pool.main.id
}

# UI Customization
resource "aws_cognito_user_pool_ui_customization" "main" {
  user_pool_id = aws_cognito_user_pool.main.id
  client_id    = aws_cognito_user_pool_client.main.id

  css = <<-EOF
    .banner-customizable {
      padding: 25px 0px 25px 0px;
      background-color: #232f3e;
    }
    
    .label-customizable {
      font-weight: 400;
      color: #232f3e;
    }
    
    .textDescription-customizable {
      padding-top: 10px;
      padding-bottom: 10px;
      display: block;
      font-size: 16px;
      max-width: 100%;
      color: #555;
    }
    
    .idpDescription-customizable {
      padding-top: 10px;
      padding-bottom: 10px;
      display: block;
      font-size: 16px;
      max-width: 100%;
      color: #555;
    }
    
    .legalText-customizable {
      color: #747474;
      font-size: 11px;
    }
    
    .submitButton-customizable {
      font-size: 14px;
      font-weight: bold;
      margin: 20px 0px 10px 0px;
      height: 40px;
      width: 100%;
      color: #fff;
      background-color: #ffa724;
      border-color: #ffa724;
    }
    
    .submitButton-customizable:hover {
      color: #fff;
      background-color: #ffb84d;
      border-color: #ffb84d;
    }
    
    .errorMessage-customizable {
      padding: 5px;
      font-size: 14px;
      width: 100%;
      background: #F5F5F5;
      border: 2px solid #D64958;
      color: #D64958;
    }
    
    .inputField-customizable {
      width: 100%;
      height: 34px;
      color: #555;
      background-color: #fff;
      border: 1px solid #ccc;
    }
    
    .inputField-customizable:focus {
      border-color: #ffa724;
      outline: 0;
    }
    
    .idpButton-customizable {
      height: 40px;
      width: 100%;
      text-align: center;
      margin-bottom: 15px;
      margin-top: 15px;
      color: #fff;
      background-color: #5bc0de;
      border-color: #46b8da;
    }
    
    .idpButton-customizable:hover {
      color: #fff;
      background-color: #31b0d5;
      border-color: #269abc;
    }
    
    .socialButton-customizable {
      height: 40px;
      text-align: left;
      width: 100%;
      margin-bottom: 15px;
      margin-top: 15px;
    }
    
    .redirect-customizable {
      text-align: center;
    }
    
    .passwordCheck-notValid-customizable {
      color: #DF312D;
    }
    
    .passwordCheck-valid-customizable {
      color: #19BF00;
    }
    
    .background-customizable {
      background-color: #fafafa;
    }
  EOF

  depends_on = [aws_cognito_user_pool_domain.main]
}

# External Identity Providers
resource "aws_cognito_identity_provider" "google" {
  count = var.enable_external_providers && var.google_client_id != "" ? 1 : 0
  
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Google"
  provider_type = "OIDC"

  provider_details = {
    client_id                = var.google_client_id
    client_secret            = var.google_client_secret
    authorize_scopes         = "openid email profile"
    oidc_issuer             = "https://accounts.google.com"
    attributes_request_method = "GET"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-google-idp"
    Environment = var.environment
    Project     = var.project_name
  }
}

resource "aws_cognito_identity_provider" "microsoft" {
  count = var.enable_external_providers && var.microsoft_client_id != "" ? 1 : 0
  
  user_pool_id  = aws_cognito_user_pool.main.id
  provider_name = "Microsoft"
  provider_type = "OIDC"

  provider_details = {
    client_id                = var.microsoft_client_id
    client_secret            = var.microsoft_client_secret
    authorize_scopes         = "openid email profile"
    oidc_issuer             = "https://login.microsoftonline.com/common/v2.0"
    attributes_request_method = "GET"
  }

  attribute_mapping = {
    email    = "email"
    username = "sub"
    name     = "name"
  }

  tags = {
    Name        = "${var.project_name}-${var.environment}-microsoft-idp"
    Environment = var.environment
    Project     = var.project_name
  }
}