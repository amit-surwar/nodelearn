# Ansible — Configuration Management

Automate server setup across multiple machines.

## What is Ansible?
Instead of SSHing into each server and running commands one by one, you write a "playbook" that says:
"On all my servers: install Node.js, copy nginx config, start PM2"

Then run `ansible-playbook` and it configures ALL servers at once.

## Ansible vs Terraform

| Tool | Purpose | Example |
|------|---------|---------|
| **Terraform** | Creates infrastructure | "Create 5 EC2 servers" |
| **Ansible** | Configures infrastructure | "Install Node.js on all 5 servers" |

They work together: Terraform creates servers, Ansible sets them up.

## Key Concepts

| Concept | What it means |
|---------|--------------|
| **Inventory** | List of servers to manage |
| **Playbook** | YAML file with tasks to run |
| **Task** | A single action (install package, copy file) |
| **Role** | Reusable group of tasks |
| **Handler** | Action triggered by a change (restart nginx) |

## Exercise Files (we'll create these step by step)

```
ansible/
  inventory.ini      # List of servers
  playbook.yml       # Main setup playbook
  roles/
    nodejs/          # Install Node.js
    nginx/           # Configure Nginx
    app/             # Deploy nodelearn
```

## Coming Soon
This exercise will be built when you're ready for Phase 6.
Complete Terraform first!
