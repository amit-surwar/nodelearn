# AWS Core Services — EC2, VPC, S3, IAM

Learn the 4 foundational AWS services that everything else builds on.

## Prerequisites
- AWS Free Tier Account: https://aws.amazon.com/free/
- AWS CLI installed: `brew install awscli`
- Configure CLI: `aws configure` (enter Access Key, Secret Key, region: ap-south-1)

---

# 1. IAM (Identity & Access Management)

## What is IAM?
IAM controls WHO can do WHAT in your AWS account.

Think of it like a company building:
- **Users** = Employees (each person gets a badge)
- **Groups** = Departments (all developers get same access)
- **Roles** = Temporary access (a contractor badge that expires)
- **Policies** = Rules (this badge can open these doors)

## Exercise 1.1: Create an IAM User

1. Go to AWS Console > IAM > Users > Create User
2. User name: `nodelearn-dev`
3. Check "Provide user access to the AWS Management Console"
4. Set a password
5. Click Next
6. Attach policies:
   - `AmazonEC2FullAccess`
   - `AmazonS3FullAccess`
   - `AmazonVPCFullAccess`
7. Click Create User
8. Download the credentials CSV (save it safely!)

## Exercise 1.2: Create an IAM Group

```
AWS Console > IAM > User Groups > Create Group
- Group name: developers
- Attach policies:
  - AmazonEC2FullAccess
  - AmazonS3ReadOnlyAccess
  - CloudWatchReadOnlyAccess
- Add user: nodelearn-dev
```

### Why Groups?
Instead of giving permissions to each user individually, you put users in groups.
When a new developer joins: just add them to the "developers" group.

## Exercise 1.3: Create an IAM Role (for EC2)

This lets your EC2 server access S3 without hardcoding credentials.

```
AWS Console > IAM > Roles > Create Role
- Trusted entity: AWS Service > EC2
- Policies: AmazonS3ReadOnlyAccess
- Role name: ec2-s3-read-role
```

### Key IAM Concepts

| Concept | What it is | Example |
|---------|-----------|---------|
| **User** | A person or app | Your dev account |
| **Group** | Collection of users | "developers" team |
| **Role** | Temporary permissions | EC2 accessing S3 |
| **Policy** | JSON rules document | "Allow read from S3 bucket X" |
| **MFA** | Two-factor auth | Required for admin accounts |

### IAM Best Practices
- NEVER use the root account for daily work
- ALWAYS enable MFA on root account
- Use groups, not individual user permissions
- Follow "least privilege" — give minimum permissions needed
- Rotate access keys regularly

---

# 2. VPC (Virtual Private Cloud)

## What is VPC?
A VPC is your own private network inside AWS. It's like having your own office building where you control:
- Who can enter (Security Groups)
- Which rooms exist (Subnets)
- The doors to the outside (Internet Gateway)

## VPC Architecture

```
VPC (10.0.0.0/16) — Your private network
│
├── Public Subnet (10.0.1.0/24) — Has internet access
│   ├── EC2 (your Node.js server)
│   └── NAT Gateway
│
├── Private Subnet (10.0.2.0/24) — No direct internet
│   └── RDS Database (if you used AWS database)
│
├── Internet Gateway — Door to the internet
│
└── Security Groups — Firewall rules
    ├── Allow port 80 (HTTP)
    ├── Allow port 443 (HTTPS)
    ├── Allow port 22 (SSH from your IP only)
    └── Allow port 3000 (Node.js app)
```

## Exercise 2.1: Explore Default VPC

```
AWS Console > VPC > Your VPCs
- You already have a default VPC
- Note its CIDR block (e.g., 172.31.0.0/16)
```

## Exercise 2.2: Create a Custom VPC

```
AWS Console > VPC > Create VPC
- Name: nodelearn-vpc
- CIDR: 10.0.0.0/16

Create Subnets:
- Public Subnet:  name=public-1,  CIDR=10.0.1.0/24, AZ=ap-south-1a
- Private Subnet: name=private-1, CIDR=10.0.2.0/24, AZ=ap-south-1a

Create Internet Gateway:
- Name: nodelearn-igw
- Attach to nodelearn-vpc

Create Route Table:
- Name: public-routes
- Add route: 0.0.0.0/0 → nodelearn-igw (sends internet traffic through gateway)
- Associate with public-1 subnet
```

## Exercise 2.3: Create Security Group

```
AWS Console > VPC > Security Groups > Create
- Name: nodelearn-sg
- VPC: nodelearn-vpc
- Inbound rules:
  - SSH (22)    from My IP only
  - HTTP (80)   from 0.0.0.0/0 (anywhere)
  - HTTPS (443) from 0.0.0.0/0
  - Custom TCP (3000) from 0.0.0.0/0
```

### VPC Concepts

| Component | What it does | Analogy |
|-----------|-------------|---------|
| **VPC** | Private network | Your office building |
| **Subnet** | Network segment | Floors in the building |
| **Public Subnet** | Has internet access | Ground floor with front door |
| **Private Subnet** | No direct internet | Secure basement |
| **Internet Gateway** | Connects VPC to internet | The front door |
| **NAT Gateway** | Lets private subnet reach internet (outgoing only) | A mail room |
| **Security Group** | Firewall for instances | Security guard at each room |
| **Route Table** | Traffic directions | Hallway signs |

---

# 3. EC2 (Elastic Compute Cloud)

## What is EC2?
A virtual server in the cloud. You choose the OS, CPU, RAM, and storage.

## Exercise 3.1: Launch EC2 in Your Custom VPC

```
AWS Console > EC2 > Launch Instance
- Name: nodelearn-server
- AMI: Ubuntu Server 24.04 LTS
- Instance type: t2.micro (free tier)
- Key pair: Create "nodelearn-key" (download .pem)
- Network: nodelearn-vpc
- Subnet: public-1
- Auto-assign public IP: Enable
- Security group: nodelearn-sg
- Storage: 8 GB gp3
- Click Launch
```

## Exercise 3.2: Connect and Deploy

```bash
# Connect
chmod 400 ~/Downloads/nodelearn-key.pem
ssh -i ~/Downloads/nodelearn-key.pem ubuntu@YOUR_PUBLIC_IP

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Clone and run
git clone https://github.com/amit-surwar/nodelearn.git
cd nodelearn
npm ci --only=production

# Create .env
nano .env
# Add: PORT=3000
# Add: MONGODB_URI=your_atlas_uri
# Add: JWT_SECRET=your_secret
# Add: NODE_ENV=production

# Start
node src/server.js
```

## Exercise 3.3: EC2 Instance Types

| Type | CPU | RAM | Use case |
|------|-----|-----|----------|
| **t2.micro** | 1 | 1 GB | Free tier, testing |
| **t3.small** | 2 | 2 GB | Small production apps |
| **t3.medium** | 2 | 4 GB | Medium traffic APIs |
| **m5.large** | 2 | 8 GB | Production workloads |
| **c5.large** | 2 | 4 GB | CPU-intensive tasks |

### EC2 Key Concepts

| Concept | What it is |
|---------|-----------|
| **AMI** | Template image (Ubuntu, Amazon Linux) |
| **Instance Type** | Server size (CPU + RAM) |
| **Key Pair** | SSH key to access the server |
| **Elastic IP** | Fixed public IP (survives restart) |
| **EBS** | Hard drive attached to instance |
| **User Data** | Script that runs on first boot |

---

# 4. S3 (Simple Storage Service)

## What is S3?
Cloud file storage. Store anything: images, videos, backups, logs, static websites.

## Exercise 4.1: Create an S3 Bucket

```
AWS Console > S3 > Create Bucket
- Bucket name: nodelearn-uploads-YOUR_NAME (must be globally unique)
- Region: ap-south-1
- Block all public access: ON (keep it private)
- Click Create
```

## Exercise 4.2: Upload Files via CLI

```bash
# Create a test file
echo "Hello from S3!" > test.txt

# Upload to S3
aws s3 cp test.txt s3://nodelearn-uploads-YOUR_NAME/test.txt

# List files in bucket
aws s3 ls s3://nodelearn-uploads-YOUR_NAME/

# Download from S3
aws s3 cp s3://nodelearn-uploads-YOUR_NAME/test.txt downloaded.txt

# Sync a folder to S3
aws s3 sync ./logs s3://nodelearn-uploads-YOUR_NAME/logs/
```

## Exercise 4.3: S3 for Static Website Hosting

```
AWS Console > S3 > Your bucket > Properties
- Static website hosting > Enable
- Index document: index.html

Create a simple HTML file and upload it:
<html><body><h1>Nodelearn</h1></body></html>

aws s3 cp index.html s3://nodelearn-uploads-YOUR_NAME/index.html

Then update bucket policy to allow public read:
Permissions > Bucket Policy > add public read policy
```

### S3 Concepts

| Concept | What it is |
|---------|-----------|
| **Bucket** | A container (like a folder) |
| **Object** | A file stored in a bucket |
| **Key** | The file path inside the bucket |
| **Region** | Where the data is physically stored |
| **Versioning** | Keep history of file changes |
| **Lifecycle** | Auto-delete old files after X days |
| **Storage Classes** | Standard (fast), Glacier (cheap, slow for archives) |

### S3 CLI Cheat Sheet

| Command | What it does |
|---------|-------------|
| `aws s3 ls` | List all buckets |
| `aws s3 ls s3://bucket/` | List files in bucket |
| `aws s3 cp file s3://bucket/` | Upload file |
| `aws s3 cp s3://bucket/file .` | Download file |
| `aws s3 sync dir s3://bucket/dir` | Sync folder |
| `aws s3 rm s3://bucket/file` | Delete file |
| `aws s3 rb s3://bucket --force` | Delete bucket |

---

# Learning Order

```
1. IAM     → Who can access what (do first!)
2. VPC     → Your private network
3. EC2     → Launch and connect to a server
4. S3      → Store files in the cloud
```

Each service builds on the previous one. IAM controls access to everything, VPC is the network EC2 lives in, and S3 is used by everything for storage.

---

# Cost Warning

| Service | Free Tier |
|---------|-----------|
| EC2 t2.micro | 750 hours/month for 12 months |
| S3 | 5 GB storage, 20K GET, 2K PUT per month |
| VPC | Free (you only pay for NAT Gateway if used) |
| IAM | Always free |

ALWAYS stop EC2 instances when not using them!
Delete S3 buckets when done with exercises.
