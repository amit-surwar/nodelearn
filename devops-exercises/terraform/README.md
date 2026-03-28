# Terraform — Infrastructure as Code

Create AWS resources using code instead of clicking in the console.

## What is Terraform?
Instead of manually creating an EC2 instance in the AWS console, you write code that says:
"Create an EC2 instance with Ubuntu, t2.micro, in ap-south-1, with these security rules"

Then run `terraform apply` and it creates everything automatically.

## Why Terraform?
- **Reproducible**: Same infra every time, no manual mistakes
- **Version controlled**: Infrastructure changes tracked in Git
- **Team friendly**: Everyone sees what infra exists by reading code
- **Multi-cloud**: Works with AWS, Azure, GCP, and more

## Key Concepts

| Concept | What it means |
|---------|--------------|
| **Provider** | Which cloud (AWS, Azure, GCP) |
| **Resource** | Something to create (EC2, S3, database) |
| **Variable** | Input values (instance type, region) |
| **Output** | Values to display (server IP, URL) |
| **State** | Terraform's record of what it created |
| **Plan** | Preview changes before applying |
| **Apply** | Create/update resources |
| **Destroy** | Delete everything Terraform created |

## Exercise Files (we'll create these step by step)

```
terraform/
  main.tf           # Main infrastructure definition
  variables.tf      # Input variables
  outputs.tf        # Output values
  provider.tf       # AWS provider config
  terraform.tfvars  # Variable values
```

## Coming Soon
This exercise will be built when you're ready for Phase 5.
Complete Docker, AWS, and Kubernetes first!
