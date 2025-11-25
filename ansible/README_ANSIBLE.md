Ansible Playbook for Refoodify (Web + LB)

This playbook automates the full deployment to existing servers (Web01, Web02, Lb01).

Prerequisites (on your local machine):
- Ansible installed (2.9+ recommended)
- SSH key with access to your Oracle Cloud VMs
- Python 3 on the remote VMs (Ubuntu usually has it)

Files:
- `inventory.example.ini` - example inventory (replace IP placeholders)
- `playbook.yml` - the main playbook
- `ansible.cfg` - config to disable host key checking
- `templates/refoodify.service.j2` - systemd service template
- `templates/refoodify-lb.conf.j2` - nginx lb site template

Usage
1. Copy `ansible/inventory.example.ini` to `ansible/inventory.ini` and replace `WEB01_IP`, `WEB02_IP`, `LB01_IP` with the real IPs.

2. Run the playbook (example):

```bash
cd /Users/user/Documents/refoodify/ansible
# Example using private key and default inventory file
ansible-playbook -i inventory.ini playbook.yml --private-key ~/.ssh/id_rsa -u ubuntu
```

If you use a different SSH key path, change `--private-key` accordingly.

What the playbook will do
- On group `webservers`:
  - apt update
  - install git, curl
  - install Node.js 18
  - clone/pull the repo into `/opt/refoodify`
  - run `npm install --production`
  - install a `refoodify` systemd service and start it

- On group `lb`:
  - apt update
  - install nginx
  - write the nginx load balancer configuration to `/etc/nginx/sites-available/refoodify-lb`
  - enable the site, remove default
  - test nginx configuration and restart

Notes and Troubleshooting
- If the play fails due to SSH or authentication, confirm the `ansible_user` and key are correct in inventory.ini
- If Node installation fails due to network restrictions, you can preinstall Node and re-run the playbook
- To run tasks step-by-step, you can limit play execution, for example: `ansible-playbook -i inventory.ini playbook.yml -l web01 --private-key ~/.ssh/id_rsa`

Security
- The playbook runs commands with `become: yes` (sudo) where necessary
- It deploys the application to `/opt/refoodify` and runs the process as `ubuntu` user via systemd

After the play completes
- Verify the web servers:
  ssh ubuntu@<WEB01_IP> 'sudo systemctl status refoodify'
  curl http://<WEB01_IP>:3000/health

- Verify the lb:
  ssh ubuntu@<LB_IP> 'sudo nginx -t && sudo systemctl status nginx'
  curl -I http://<LB_IP>/health

If you want, I can:
- Build and test a dry-run playbook here (I cannot SSH to your servers from this environment)
- Help you run the playbook step-by-step and debug any failures; paste outputs here and I will analyze
