# CLI Supabase

```bash

################################################################
# ECHEC installation de Docker sous WSL2
################################################################

supabase stop
supabase: command not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ npx supabase@latest --version
Need to install the following packages:
supabase@2.40.7
Ok to proceed? (y) y

npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
2.40.7
```

```bash
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase@latest login
 WARN  1 deprecated subdependencies found: node-domexception@1.0.0
Packages: +26
++++++++++++++++++++++++++
Progress: resolved 26, reused 11, downloaded 15, added 26, done
 WARN  Failed to create bin at /home/yandev/.cache/pnpm/dlx/efc600744e4bf2851939cb757b334b64f2e714968eabdf1c717355e6b7006c8d/19959a99ac8-11567/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/.cache/pnpm/dlx/efc600744e4bf2851939cb757b334b64f2e714968eabdf1c717355e6b7006c8d/19959a99ac8-11567/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
.cache/pnpm/dlx/efc600744e4bf2851939cb757b334b64f2e714968eabdf1c717355e6b7006c8d/19959a99ac8-11567/node_modules/.pnpm/supabase@2.40.7/node_mo.cache/pnpm/dlx/efc600744e4bf2851939cb757b334b64f2e714968eabdf1c717355e6b7006c8d/19959a99ac8-11567/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase: Running postinstall script, done in 24.6s

Hello from Supabase! Press Enter to open browser and login automatically.

Here is your login link in case browser did not open https://supabase.com/dashboard/cli/login?session_id=ae8faeb4-a5d8-4bd7-89e2-4c4766f2f5b7&token_name=cli_yandev@LAPTOP-CE57E7VI_1758145936&public_key=046da9ae0ea058f94a05908159c4573ea02bb84ff1b252d7d3392cb759e24cbab4388e7fbd10ee8f84b606db84a00d9c16fb53ef82394d26e4c5adbed9f6dbbc62

exec: "wslview": executable file not found in $PATH
Enter your verification code: b47d9e55
Token cli_yandev@LAPTOP-CE57E7VI_1758145936 created successfully.

You are now logged in. Happy coding!

yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ supabase projects list
supabase: command not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ supabase --version
supabase: command not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm add -g supabase

   ╭──────────────────────────────────────────╮
   │                                          │
   │   Update available! 10.8.1 → 10.17.0.    │
   │   Changelog: https://pnpm.io/v/10.17.0   │
   │     To update, run: pnpm self-update     │
   │                                          │
   ╰──────────────────────────────────────────╯

 WARN  1 deprecated subdependencies found: node-domexception@1.0.0
Packages: +26
++++++++++++++++++++++++++
Progress: resolved 57, reused 30, downloaded 1, added 26, done
 WARN  Failed to create bin at /home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
 WARN  Failed to create bin at /home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
 WARN  Failed to create bin at /home/yandev/.local/share/pnpm/supabase. ENOENT: no such file or directory, open '/home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'

/home/yandev/.local/share/pnpm/global/5:
+ supabase 2.40.7

╭ Warning ──────────────────────────────────────────────────────────────────────────────────────╮
│                                                                                               │
│   Ignored build scripts: supabase.                                                            │
│   Run "pnpm approve-builds -g" to pick which dependencies should be allowed to run scripts.   │
│                                                                                               │
╰───────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 3.3s using pnpm v10.8.1
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ npm install -g supabase
npm warn deprecated node-domexception@1.0.0: Use your platform's native DOMException instead
npm error code 1
npm error path /home/yandev/.nvm/versions/node/v22.18.0/lib/node_modules/supabase
npm error command failed
npm error command sh -c node scripts/postinstall.js
npm error node:internal/modules/run_main:123
npm error     triggerUncaughtException(
npm error     ^
npm error Installing Supabase CLI as a global module is not supported.
npm error Please use one of the supported package managers: https://github.com/supabase/cli#install-the-cli
npm error
npm error (Use `node --trace-uncaught ...` to show where the exception was thrown)
npm error
npm error Node.js v22.18.0
npm error A complete log of this run can be found in: /home/yandev/.npm/_logs/2025-09-17T22_04_20_224Z-debug-0.log
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ curl -sL https://github.com/supabase/cli/releases/latest/download/install.sh | sh
sh: 1: Not: not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm add -D supabase
 WARN  1 deprecated subdependencies found: node-domexception@1.0.0
Packages: +21
+++++++++++++++++++++
Progress: resolved 517, reused 468, downloaded 7, added 21, done
 WARN  Failed to create bin at /home/yandev/projets/rougecardinalcompany/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/projets/rougecardinalcompany/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
 WARN  Failed to create bin at /home/yandev/projets/rougecardinalcompany/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/projets/rougecardinalcompany/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
 WARN  Failed to create bin at /home/yandev/projets/rougecardinalcompany/node_modules/.bin/supabase. ENOENT: no such file or directory, open '/home/yandev/projets/rougecardinalcompany/node_modules/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
 WARN  Issues with peer dependencies found
.
├─┬ @typescript-eslint/parser 8.38.0
│ ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
│ └─┬ @typescript-eslint/typescript-estree 8.38.0
│   ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
│   └─┬ @typescript-eslint/project-service 8.38.0
│     ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
│     └─┬ @typescript-eslint/tsconfig-utils 8.38.0
│       └── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
└─┬ eslint-config-next 15.3.1
  └─┬ @typescript-eslint/eslint-plugin 8.38.0
    ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
    └─┬ @typescript-eslint/type-utils 8.38.0
      ├── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2
      └─┬ @typescript-eslint/utils 8.38.0
        └── ✕ unmet peer typescript@">=4.8.4 <5.9.0": found 5.9.2

devDependencies:
+ supabase 2.40.7

╭ Warning ───────────────────────────────────────────────────────────────────────────────────╮
│                                                                                            │
│   Ignored build scripts: supabase.                                                         │
│   Run "pnpm approve-builds" to pick which dependencies should be allowed to run scripts.   │
│                                                                                            │
╰────────────────────────────────────────────────────────────────────────────────────────────╯

Done in 6.9s using pnpm v10.8.1
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ supabase --version
supabase: command not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ brew install supabase/tap/supabase
Command 'brew' not found, did you mean:
  command 'brec' from deb bplay (0.991-10.2)
  command 'qbrew' from deb qbrew (0.4.1-8build1)
Try: sudo apt install <deb name>
```

```bash
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ npx supabase --help
sh: 1: supabase: not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ npm install --save-dev supabase
npm error Cannot read properties of null (reading 'matches')
npm error A complete log of this run can be found in: /home/yandev/.npm/_logs/2025-09-17T22_17_54_891Z-debug-0.log
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm --version
10.8.1
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm bin -g
/home/yandev/.local/share/pnpm
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ echo 'export PATH="$(pnpm bin -g):$PATH"' >> ~/.profile && source ~/.profile
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ which supabase || command -v supabase || true && supabase --version || true
supabase: command not found
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm add -g supabase
 WARN  1 deprecated subdependencies found: node-domexception@1.0.0
Already up to date
Progress: resolved 57, reused 31, downloaded 0, added 0, done
 WARN  Failed to create bin at /home/yandev/.local/share/pnpm/supabase. ENOENT: no such file or directory, open '/home/yandev/.local/share/pnpm/global/5/.pnpm/supabase@2.40.7/node_modules/supabase/bin/supabase'
Done in 2.2s using pnpm v10.8.1
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ npm install supabase --save-dev
npm error Cannot read properties of null (reading 'matches')
npm error A complete log of this run can be found in: /home/yandev/.npm/_logs/2025-09-17T22_28_17_932Z-debug-0.log

 
 yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase --help
Supabase CLI 2.40.7

Usage:
  supabase [command]

Quick Start:
  bootstrap            Bootstrap a Supabase project from a starter template

Local Development:
  db                   Manage Postgres databases
  gen                  Run code generation tools
  init                 Initialize a local project
  inspect              Tools to inspect your Supabase project
  link                 Link to a Supabase project
  login                Authenticate using an access token
  logout               Log out and delete access tokens locally
  migration            Manage database migration scripts
  seed                 Seed a Supabase project from supabase/config.toml
  services             Show versions of all Supabase services
  start                Start containers for Supabase local development
  status               Show status of local Supabase containers
  stop                 Stop all local Supabase containers
  test                 Run tests on local Supabase containers
  unlink               Unlink a Supabase project

Management APIs:
  backups              Manage Supabase physical backups
  branches             Manage Supabase preview branches
  config               Manage Supabase project configurations
  domains              Manage custom domain names for Supabase projects
  encryption           Manage encryption keys of Supabase projects
  functions            Manage Supabase Edge functions
  network-bans         Manage network bans
  network-restrictions Manage network restrictions
  orgs                 Manage Supabase organizations
  postgres-config      Manage Postgres database config
  projects             Manage Supabase projects
  secrets              Manage Supabase secrets
  snippets             Manage Supabase SQL snippets
  ssl-enforcement      Manage SSL enforcement configuration
  sso                  Manage Single Sign-On (SSO) authentication for projects
  storage              Manage Supabase Storage objects
  vanity-subdomains    Manage vanity subdomains for Supabase projects

Additional Commands:
  completion           Generate the autocompletion script for the specified shell
  help                 Help about any command

Flags:
      --create-ticket                                  create a support ticket for any CLI error
      --debug                                          output debug logs to stderr
      --dns-resolver [ native | https ]                lookup domain names using the specified resolver (default native)
      --experimental                                   enable experimental features
  -h, --help                                           help for supabase
      --network-id string                              use the specified docker network instead of a generated one
  -o, --output [ env | pretty | json | toml | yaml ]   output format of status variables (default pretty)
      --profile string                                 use a specific profile for connecting to Supabase API (default "supabase")
  -v, --version                                        version for supabase
      --workdir string                                 path to a Supabase project directory
      --yes                                            answer yes to all prompts

Use "supabase [command] --help" for more information about a command.

yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase stop || true
failed to list containers: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
Try rerunning the command with --debug to troubleshoot the error.



################################################################
# Résolution du problème d'installation de Docker sous WSL2
################################################################

yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo systemctl start docker
sudo systemctl enable docker
[sudo] password for yandev: 
Failed to start docker.service: Unit docker.service not found.
Failed to enable unit: Unit file docker.service does not exist.


yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo apt-get update
sudo apt-get install -y ca-certificates curl gnupg
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://apt.postgresql.org/pub/repos/apt noble-pgdg InRelease         
Get:3 http://archive.ubuntu.com/ubuntu noble-updates InRelease [126 kB]    
Get:4 http://security.ubuntu.com/ubuntu noble-security InRelease [126 kB]  
Get:5 http://archive.ubuntu.com/ubuntu noble-backports InRelease [126 kB]
Get:6 http://archive.ubuntu.com/ubuntu noble-updates/main amd64 Packages [1415 kB]
Get:7 http://security.ubuntu.com/ubuntu noble-security/main amd64 Components [21.6 kB]
Get:8 http://security.ubuntu.com/ubuntu noble-security/universe amd64 Components [52.2 kB]
Get:9 http://archive.ubuntu.com/ubuntu noble-updates/main amd64 Components [175 kB]
Get:10 http://security.ubuntu.com/ubuntu noble-security/restricted amd64 Components [208 B]              
Get:11 http://security.ubuntu.com/ubuntu noble-security/restricted amd64 c-n-f Metadata [496 B]
Get:12 http://security.ubuntu.com/ubuntu noble-security/multiverse amd64 Components [212 B]           
Get:13 http://security.ubuntu.com/ubuntu noble-security/multiverse amd64 c-n-f Metadata [452 B]       
Get:14 http://archive.ubuntu.com/ubuntu noble-updates/universe amd64 Packages [1484 kB]
Get:15 http://archive.ubuntu.com/ubuntu noble-updates/universe Translation-en [299 kB]
Get:16 http://archive.ubuntu.com/ubuntu noble-updates/universe amd64 Components [377 kB]                   
Get:17 http://archive.ubuntu.com/ubuntu noble-updates/restricted amd64 Packages [1901 kB]                  
Get:18 http://archive.ubuntu.com/ubuntu noble-updates/restricted Translation-en [426 kB]                   
Get:19 http://archive.ubuntu.com/ubuntu noble-updates/restricted amd64 Components [212 B]                  
Get:20 http://archive.ubuntu.com/ubuntu noble-updates/multiverse amd64 Packages [32.0 kB]                  
Get:21 http://archive.ubuntu.com/ubuntu noble-updates/multiverse Translation-en [5500 B]                   
Get:22 http://archive.ubuntu.com/ubuntu noble-updates/multiverse amd64 Components [940 B]                  
Get:23 http://archive.ubuntu.com/ubuntu noble-backports/main amd64 Components [7076 B]                     
Get:24 http://archive.ubuntu.com/ubuntu noble-backports/universe amd64 Components [19.2 kB]                
Get:25 http://archive.ubuntu.com/ubuntu noble-backports/restricted amd64 Components [216 B]                
Get:26 http://archive.ubuntu.com/ubuntu noble-backports/multiverse amd64 Components [212 B]                
Fetched 6596 kB in 13s (496 kB/s)                                                                          
Reading package lists... Done
W: http://apt.postgresql.org/pub/repos/apt/dists/noble-pgdg/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
ca-certificates is already the newest version (20240203).
ca-certificates set to manually installed.
curl is already the newest version (8.5.0-2ubuntu10.6).
curl set to manually installed.
gnupg is already the newest version (2.4.4-2ubuntu17.3).
gnupg set to manually installed.
0 upgraded, 0 newly installed, 0 to remove and 77 not upgraded.
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg \
| sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo apt-get update
Hit:1 http://security.ubuntu.com/ubuntu noble-security InRelease
Hit:2 http://apt.postgresql.org/pub/repos/apt noble-pgdg InRelease                                        
Hit:3 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:4 http://archive.ubuntu.com/ubuntu noble-updates InRelease
Hit:5 http://archive.ubuntu.com/ubuntu noble-backports InRelease
Reading package lists... Done
W: http://apt.postgresql.org/pub/repos/apt/dists/noble-pgdg/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
Package docker-ce is not available, but is referred to by another package.
This may mean that the package is missing, has been obsoleted, or
is only available from another source

Package docker-ce-cli is not available, but is referred to by another package.
This may mean that the package is missing, has been obsoleted, or
is only available from another source

E: Package 'docker-ce' has no installation candidate
E: Package 'docker-ce-cli' has no installation candidate
E: Unable to locate package containerd.io
E: Couldn't find any package by glob 'containerd.io'
E: Couldn't find any package by regex 'containerd.io'
E: Unable to locate package docker-buildx-plugin
E: Unable to locate package docker-compose-plugin
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
newgrp docker
Failed to enable unit: Unit file docker.service does not exist.
usermod: group 'docker' does not exist
newgrp: group 'docker' does not exist
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ . /etc/os-release
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \
https://download.docker.com/linux/ubuntu ${VERSION_CODENAME} stable" \
| sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo apt-get update
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Hit:2 http://security.ubuntu.com/ubuntu noble-security InRelease            
Hit:3 http://archive.ubuntu.com/ubuntu noble-updates InRelease              
Hit:4 http://archive.ubuntu.com/ubuntu noble-backports InRelease                 
Get:5 https://download.docker.com/linux/ubuntu noble InRelease [48.8 kB]         
Hit:6 http://apt.postgresql.org/pub/repos/apt noble-pgdg InRelease
Get:7 https://download.docker.com/linux/ubuntu noble/stable amd64 Packages [30.5 kB]
Fetched 79.3 kB in 1s (114 kB/s)    
Reading package lists... Done
W: http://apt.postgresql.org/pub/repos/apt/dists/noble-pgdg/InRelease: Key is stored in legacy trusted.gpg keyring (/etc/apt/trusted.gpg), see the DEPRECATION section in apt-key(8) for details.
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
Reading package lists... Done
Building dependency tree... Done
Reading state information... Done
The following additional packages will be installed:
  docker-ce-rootless-extras iptables libip4tc2 libip6tc2 libnetfilter-conntrack3 libnfnetlink0
  libnftables1 libnftnl11 libslirp0 nftables pigz slirp4netns
Suggested packages:
  cgroupfs-mount | cgroup-lite docker-model-plugin firewalld
The following NEW packages will be installed:
  containerd.io docker-buildx-plugin docker-ce docker-ce-cli docker-ce-rootless-extras
  docker-compose-plugin iptables libip4tc2 libip6tc2 libnetfilter-conntrack3 libnfnetlink0 libnftables1
  libnftnl11 libslirp0 nftables pigz slirp4netns
0 upgraded, 17 newly installed, 0 to remove and 77 not upgraded.
Need to get 104 MB of archives.
After this operation, 435 MB of additional disk space will be used.
Get:1 http://archive.ubuntu.com/ubuntu noble/main amd64 libip4tc2 amd64 1.8.10-3ubuntu2 [23.3 kB]
Get:2 https://download.docker.com/linux/ubuntu noble/stable amd64 containerd.io amd64 1.7.27-1 [30.5 MB]
Get:3 http://archive.ubuntu.com/ubuntu noble/main amd64 libip6tc2 amd64 1.8.10-3ubuntu2 [23.7 kB]
Get:4 http://archive.ubuntu.com/ubuntu noble/main amd64 libnfnetlink0 amd64 1.0.2-2build1 [14.8 kB]
Get:5 http://archive.ubuntu.com/ubuntu noble/main amd64 libnetfilter-conntrack3 amd64 1.0.9-6build1 [45.2 kB]
Get:6 http://archive.ubuntu.com/ubuntu noble/main amd64 libnftnl11 amd64 1.2.6-2build1 [66.0 kB]
Get:7 http://archive.ubuntu.com/ubuntu noble/main amd64 iptables amd64 1.8.10-3ubuntu2 [381 kB]
Get:8 http://archive.ubuntu.com/ubuntu noble/universe amd64 pigz amd64 2.8-1 [65.6 kB]
Get:9 http://archive.ubuntu.com/ubuntu noble/main amd64 libnftables1 amd64 1.0.9-1build1 [358 kB]
Get:10 http://archive.ubuntu.com/ubuntu noble/main amd64 nftables amd64 1.0.9-1build1 [69.8 kB]
Get:11 http://archive.ubuntu.com/ubuntu noble/main amd64 libslirp0 amd64 4.7.0-1ubuntu3 [63.8 kB]
Get:12 http://archive.ubuntu.com/ubuntu noble/universe amd64 slirp4netns amd64 1.2.1-1build2 [34.9 kB]
Get:13 https://download.docker.com/linux/ubuntu noble/stable amd64 docker-ce-cli amd64 5:28.4.0-1~ubuntu.24.04~noble [16.5 MB]
Get:14 https://download.docker.com/linux/ubuntu noble/stable amd64 docker-ce amd64 5:28.4.0-1~ubuntu.24.04~noble [19.7 MB]
Get:15 https://download.docker.com/linux/ubuntu noble/stable amd64 docker-buildx-plugin amd64 0.27.0-1~ubuntu.24.04~noble [15.9 MB]
Get:16 https://download.docker.com/linux/ubuntu noble/stable amd64 docker-ce-rootless-extras amd64 5:28.4.0-1~ubuntu.24.04~noble [6479 kB]
Get:17 https://download.docker.com/linux/ubuntu noble/stable amd64 docker-compose-plugin amd64 2.39.2-1~ubuntu.24.04~noble [14.3 MB]
Fetched 104 MB in 2min 20s (747 kB/s)                                                                      
Selecting previously unselected package containerd.io.
(Reading database ... 82397 files and directories currently installed.)
Preparing to unpack .../00-containerd.io_1.7.27-1_amd64.deb ...
Unpacking containerd.io (1.7.27-1) ...
Selecting previously unselected package docker-ce-cli.
Preparing to unpack .../01-docker-ce-cli_5%3a28.4.0-1~ubuntu.24.04~noble_amd64.deb ...
Unpacking docker-ce-cli (5:28.4.0-1~ubuntu.24.04~noble) ...
Selecting previously unselected package libip4tc2:amd64.
Preparing to unpack .../02-libip4tc2_1.8.10-3ubuntu2_amd64.deb ...
Unpacking libip4tc2:amd64 (1.8.10-3ubuntu2) ...
Selecting previously unselected package libip6tc2:amd64.
Preparing to unpack .../03-libip6tc2_1.8.10-3ubuntu2_amd64.deb ...
Unpacking libip6tc2:amd64 (1.8.10-3ubuntu2) ...
Selecting previously unselected package libnfnetlink0:amd64.
Preparing to unpack .../04-libnfnetlink0_1.0.2-2build1_amd64.deb ...
Unpacking libnfnetlink0:amd64 (1.0.2-2build1) ...
Selecting previously unselected package libnetfilter-conntrack3:amd64.
Preparing to unpack .../05-libnetfilter-conntrack3_1.0.9-6build1_amd64.deb ...
Unpacking libnetfilter-conntrack3:amd64 (1.0.9-6build1) ...
Selecting previously unselected package libnftnl11:amd64.
Preparing to unpack .../06-libnftnl11_1.2.6-2build1_amd64.deb ...
Unpacking libnftnl11:amd64 (1.2.6-2build1) ...
Selecting previously unselected package iptables.
Preparing to unpack .../07-iptables_1.8.10-3ubuntu2_amd64.deb ...
Unpacking iptables (1.8.10-3ubuntu2) ...
Selecting previously unselected package docker-ce.
Preparing to unpack .../08-docker-ce_5%3a28.4.0-1~ubuntu.24.04~noble_amd64.deb ...
Unpacking docker-ce (5:28.4.0-1~ubuntu.24.04~noble) ...
Selecting previously unselected package pigz.
Preparing to unpack .../09-pigz_2.8-1_amd64.deb ...
Unpacking pigz (2.8-1) ...
Selecting previously unselected package libnftables1:amd64.
Preparing to unpack .../10-libnftables1_1.0.9-1build1_amd64.deb ...
Unpacking libnftables1:amd64 (1.0.9-1build1) ...
Selecting previously unselected package nftables.
Preparing to unpack .../11-nftables_1.0.9-1build1_amd64.deb ...
Unpacking nftables (1.0.9-1build1) ...
Selecting previously unselected package docker-buildx-plugin.
Preparing to unpack .../12-docker-buildx-plugin_0.27.0-1~ubuntu.24.04~noble_amd64.deb ...
Unpacking docker-buildx-plugin (0.27.0-1~ubuntu.24.04~noble) ...
Selecting previously unselected package docker-ce-rootless-extras.
Preparing to unpack .../13-docker-ce-rootless-extras_5%3a28.4.0-1~ubuntu.24.04~noble_amd64.deb ...
Unpacking docker-ce-rootless-extras (5:28.4.0-1~ubuntu.24.04~noble) ...
Selecting previously unselected package docker-compose-plugin.
Preparing to unpack .../14-docker-compose-plugin_2.39.2-1~ubuntu.24.04~noble_amd64.deb ...
Unpacking docker-compose-plugin (2.39.2-1~ubuntu.24.04~noble) ...
Selecting previously unselected package libslirp0:amd64.
Preparing to unpack .../15-libslirp0_4.7.0-1ubuntu3_amd64.deb ...
Unpacking libslirp0:amd64 (4.7.0-1ubuntu3) ...
Selecting previously unselected package slirp4netns.
Preparing to unpack .../16-slirp4netns_1.2.1-1build2_amd64.deb ...
Unpacking slirp4netns (1.2.1-1build2) ...
Setting up libip4tc2:amd64 (1.8.10-3ubuntu2) ...
Setting up libip6tc2:amd64 (1.8.10-3ubuntu2) ...
Setting up libnftnl11:amd64 (1.2.6-2build1) ...
Setting up docker-buildx-plugin (0.27.0-1~ubuntu.24.04~noble) ...
Setting up containerd.io (1.7.27-1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/containerd.service → /usr/lib/systemd/system/containerd.service.
Setting up docker-compose-plugin (2.39.2-1~ubuntu.24.04~noble) ...
Setting up docker-ce-cli (5:28.4.0-1~ubuntu.24.04~noble) ...
Setting up libslirp0:amd64 (4.7.0-1ubuntu3) ...
Setting up pigz (2.8-1) ...
Setting up libnfnetlink0:amd64 (1.0.2-2build1) ...
Setting up docker-ce-rootless-extras (5:28.4.0-1~ubuntu.24.04~noble) ...
Setting up libnftables1:amd64 (1.0.9-1build1) ...
Setting up nftables (1.0.9-1build1) ...
Setting up slirp4netns (1.2.1-1build2) ...
Setting up libnetfilter-conntrack3:amd64 (1.0.9-6build1) ...
Setting up iptables (1.8.10-3ubuntu2) ...
update-alternatives: using /usr/sbin/iptables-legacy to provide /usr/sbin/iptables (iptables) in auto mode
update-alternatives: using /usr/sbin/ip6tables-legacy to provide /usr/sbin/ip6tables (ip6tables) in auto mode
update-alternatives: using /usr/sbin/iptables-nft to provide /usr/sbin/iptables (iptables) in auto mode
update-alternatives: using /usr/sbin/ip6tables-nft to provide /usr/sbin/ip6tables (ip6tables) in auto mode
update-alternatives: using /usr/sbin/arptables-nft to provide /usr/sbin/arptables (arptables) in auto mode
update-alternatives: using /usr/sbin/ebtables-nft to provide /usr/sbin/ebtables (ebtables) in auto mode
Setting up docker-ce (5:28.4.0-1~ubuntu.24.04~noble) ...
Created symlink /etc/systemd/system/multi-user.target.wants/docker.service → /usr/lib/systemd/system/docker.service.
Created symlink /etc/systemd/system/sockets.target.wants/docker.socket → /usr/lib/systemd/system/docker.socket.
Processing triggers for man-db (2.12.0-4build2) ...
Processing triggers for libc-bin (2.39-0ubuntu8.5) ...
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo systemctl enable --now docker || sudo service docker start
Synchronizing state of docker.service with SysV service script with /usr/lib/systemd/systemd-sysv-install.
Executing: /usr/lib/systemd/systemd-sysv-install enable docker
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo groupadd docker 2>/dev/null || true
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ sudo usermod -aG docker "$USER"
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ newgrp docker
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ docker version
Client: Docker Engine - Community
 Version:           28.4.0
 API version:       1.51
 Go version:        go1.24.7
 Git commit:        d8eb465
 Built:             Wed Sep  3 20:57:32 2025
 OS/Arch:           linux/amd64
 Context:           default

Server: Docker Engine - Community
 Engine:
  Version:          28.4.0
  API version:      1.51 (minimum version 1.24)
  Go version:       go1.24.7
  Git commit:       249d679
  Built:            Wed Sep  3 20:57:32 2025
  OS/Arch:          linux/amd64
  Experimental:     false
 containerd:
  Version:          1.7.27
  GitCommit:        05044ec0a9a75232cad458027ca83437aae3f4da
 runc:
  Version:          1.2.5
  GitCommit:        v1.2.5-0-g59923ef
 docker-init:
  Version:          0.19.0
  GitCommit:        de40ad0
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ docker run --rm hello-world
Unable to find image 'hello-world:latest' locally
latest: Pulling from library/hello-world
17eec7bbc9d7: Pull complete 
Digest: sha256:54e66cc1dd1fcb1c3c58bd8017914dbed8701e2d8c74d9262e26bd9cc1642d31
Status: Downloaded newer image for hello-world:latest

Hello from Docker!
This message shows that your installation appears to be working correctly.

To generate this message, Docker took the following steps:
 1. The Docker client contacted the Docker daemon.
 2. The Docker daemon pulled the "hello-world" image from the Docker Hub.
    (amd64)
 3. The Docker daemon created a new container from that image which runs the
    executable that produces the output you are currently reading.
 4. The Docker daemon streamed that output to the Docker client, which sent it
    to your terminal.

To try something more ambitious, you can run an Ubuntu container with:
 $ docker run -it ubuntu bash

Share images, automate workflows, and more with a free Docker ID:
 https://hub.docker.com/

For more examples and ideas, visit:
 https://docs.docker.com/get-started/



```

```bash
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase --help
Supabase CLI 2.40.7

Usage:
  supabase [command]

Quick Start:
  bootstrap            Bootstrap a Supabase project from a starter template

Local Development:
  db                   Manage Postgres databases
  gen                  Run code generation tools
  init                 Initialize a local project
  inspect              Tools to inspect your Supabase project
  link                 Link to a Supabase project
  login                Authenticate using an access token
  logout               Log out and delete access tokens locally
  migration            Manage database migration scripts
  seed                 Seed a Supabase project from supabase/config.toml
  services             Show versions of all Supabase services
  start                Start containers for Supabase local development
  status               Show status of local Supabase containers
  stop                 Stop all local Supabase containers
  test                 Run tests on local Supabase containers
  unlink               Unlink a Supabase project

Management APIs:
  backups              Manage Supabase physical backups
  branches             Manage Supabase preview branches
  config               Manage Supabase project configurations
  domains              Manage custom domain names for Supabase projects
  encryption           Manage encryption keys of Supabase projects
  functions            Manage Supabase Edge functions
  network-bans         Manage network bans
  network-restrictions Manage network restrictions
  orgs                 Manage Supabase organizations
  postgres-config      Manage Postgres database config
  projects             Manage Supabase projects
  secrets              Manage Supabase secrets
  snippets             Manage Supabase SQL snippets
  ssl-enforcement      Manage SSL enforcement configuration
  sso                  Manage Single Sign-On (SSO) authentication for projects
  storage              Manage Supabase Storage objects
  vanity-subdomains    Manage vanity subdomains for Supabase projects

Additional Commands:
  completion           Generate the autocompletion script for the specified shell
  help                 Help about any command

Flags:
      --create-ticket                                  create a support ticket for any CLI error
      --debug                                          output debug logs to stderr
      --dns-resolver [ native | https ]                lookup domain names using the specified resolver (default native)
      --experimental                                   enable experimental features
  -h, --help                                           help for supabase
      --network-id string                              use the specified docker network instead of a generated one
  -o, --output [ env | pretty | json | toml | yaml ]   output format of status variables (default pretty)
      --profile string                                 use a specific profile for connecting to Supabase API (default "supabase")
  -v, --version                                        version for supabase
      --workdir string                                 path to a Supabase project directory
      --yes                                            answer yes to all prompts

Use "supabase [command] --help" for more information about a command.

yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase db diff -f apply_declarative_schema
Creating shadow database...
17.6.1.002: Pulling from supabase/postgres
76249c7cd503: Pulling fs layer 
2a4c546093c6: Pulling fs layer 
623f83e081da: Pulling fs layer 
c6250bada4b7: Waiting 
9b9799ec51e2: Waiting 
878abd562d46: Waiting 
4f4fb700ef54: Waiting 
bcbf3bed5bb4: Waiting 
1451fae17243: Waiting 
eea23820e01b: Waiting 
3054f5ce7677: Waiting 
81e53b78baf3: Waiting 
90e185ad99a2: Waiting 
5e73ebecf107: Waiting 
c7950f3b487e: Pulling fs layer 
c7950f3b487e: Waiting 
f532e4a7f885: Pulling fs layer 
e8390d87761f: Pulling fs layer 
8c77845f437e: Waiting 
80a6269b82d8: Waiting 
5b51a0b79fcd: Waiting 
b1afca5cbbbf: Waiting 
02c52d76a223: Waiting 
0a22a6190cde: Waiting 
d4b5b76a5879: Waiting 
a8e1b30629f3: Waiting 
a7e8c1311d07: Waiting 
84307154ff92: Waiting 
ee1c00b07e3d: Pull complete 
64474c555085: Pull complete 
8e203c7e259a: Pull complete 
5eeb71b97b65: Pull complete 
42953a9d2b3d: Pull complete 
d6897c661d09: Pull complete 
e7efb23c43fd: Pull complete 
6c4846c1de52: Pull complete 
ad60608cb588: Pull complete 
0408de15045a: Pull complete 
a970c6366d2b: Pull complete 
99a6f3ec6aed: Pull complete 
ec4d516e6b0b: Pull complete 
2cce20a80a1b: Pull complete 
ec3cf3cbec87: Pull complete 
c100614641d0: Pull complete 
c9ee1c5ec0c7: Pull complete 
f56b7f3c858b: Pull complete 
b19ab8bd6402: Pull complete 
1825d73c1c65: Pull complete 
dc73e29f210b: Pull complete 
Digest: sha256:3f5e3b691d5887161e1b977302b66122eb6cfdf2a6358bdad493454efb75f8a6
Status: Downloaded newer image for public.ecr.aws/supabase/postgres:17.6.1.002
Skipping migration README-migrations.md... (file name must match pattern "<timestamp>_name.sql")
Skipping migration sync_existing_profiles.sql... (file name must match pattern "<timestamp>_name.sql")
Initialising schema...
v2.47.0: Pulling from supabase/realtime
failed to display json stream: toomanyrequests: Rate exceeded
Retrying after 4s: public.ecr.aws/supabase/realtime:v2.47.0
v2.47.0: Pulling from supabase/realtime
2d429b9e73a6: Downloading [=========================================>         ]   24.2MB/29.13MB
f56a2317bba1: Pull complete 
e1db619441c1: Pull complete 
dc94e62e5138: Pull complete 
c0c90b0dab62: Pull complete 
47740d401ba0: Pull complete 
8572827928ad: Pull complete 
4f4fb700ef54: Pull complete 
Digest: sha256:6b26b3679de63aec6b4849c02140d8f55b65ce2eecadcd5e5b712f596d0249a2
Status: Downloaded newer image for public.ecr.aws/supabase/realtime:v2.47.0
v1.26.5: Pulling from supabase/storage-api
0368fd46e3c6: Pull complete 
b28513d61989: Pull complete 
d47cf426aea3: Pull complete 
56e51cbf72b7: Pull complete 
c7d521fa3a9e: Pull complete 
2b30a0aca91d: Pull complete 
ddcae4c34215: Pull complete 
8624a3157c23: Pull complete 
8e2feff712a5: Pull complete 
b568cfad00f2: Pull complete 
Digest: sha256:e6b603040889a574b641b46f7876dfae1d0aa5c3c2e07eb0551f812c0f5ccb6c
Status: Downloaded newer image for public.ecr.aws/supabase/storage-api:v1.26.5
v2.179.0: Pulling from supabase/gotrue
9824c27679d3: Pull complete 
6e4298db6b80: Pull complete 
b3c4a98a4ddd: Pull complete 
1b998bfcdb55: Pull complete 
3332e68a49bb: Pull complete 
7e8c14f04798: Pull complete 
Digest: sha256:658cf69f57d48e10cbe508a79874e6067348b82a4d216a0bb446c067d7a246f9
Status: Downloaded newer image for public.ecr.aws/supabase/gotrue:v2.179.0
Seeding globals from roles.sql...
Applying migration 20250917_seed_home_hero_slides.sql...
ERROR: relation "public.home_hero_slides" does not exist (SQLSTATE 42P01)
At statement: 0                                                          
-- Seed initial des slides du hero (idempotent via upsert sur slug)      
-- Concerne: public.home_hero_slides                                     
                                                                         
insert into public.home_hero_slides as h (                               
^
)                                                          
Try rerunning the command with --debug to troubleshoot the error.

################################################################
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase db diff -f apply_declarative_schema --debug
Using project host: supabase.co
Supabase CLI 2.40.7
Creating shadow database...
Skipping migration README-migrations.md... (file name must match pattern "<timestamp>_name.sql")
Skipping migration sync_existing_profiles.sql... (file name must match pattern "<timestamp>_name.sql")
2025/09/18 01:39:25 PG Send: {"Type":"StartupMessage","ProtocolVersion":196608,"Parameters":{"database":"postgres","user":"postgres"}}
2025/09/18 01:39:25 PG Recv: {"Type":"AuthenticationSASL","AuthMechanisms":["SCRAM-SHA-256"]}
2025/09/18 01:39:25 PG Send: {"Type":"SASLInitialResponse","AuthMechanism":"SCRAM-SHA-256","Data":"n,,n=,r=mDSFMf38NUByVFgn4fWIra4x"}
2025/09/18 01:39:25 PG Recv: {"Type":"AuthenticationSASLContinue","Data":"r=mDSFMf38NUByVFgn4fWIra4xv8vQvjiz10C6XBX5I+v/tFne,s=jAidVxT9erGDZGFaUIhQkg==,i=4096"}
2025/09/18 01:39:25 PG Send: {"Type":"SASLResponse","Data":"c=biws,r=mDSFMf38NUByVFgn4fWIra4xv8vQvjiz10C6XBX5I+v/tFne,p=MsOWb6MDpL487R8eRnaQOspiBHUKC0Q7YwbDteS14cE="}
2025/09/18 01:39:25 PG Recv: {"Type":"AuthenticationSASLFinal","Data":"v=ewDofiErajZiW3Ai5sZ3CalPQpXsHpH7qWAKjqsawws="}
2025/09/18 01:39:25 PG Recv: {"Type":"AuthenticationOK"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"in_hot_standby","Value":"off"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"integer_datetimes","Value":"on"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"TimeZone","Value":"UTC"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"IntervalStyle","Value":"postgres"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"is_superuser","Value":"off"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"application_name","Value":""}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"default_transaction_read_only","Value":"off"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"scram_iterations","Value":"4096"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"DateStyle","Value":"ISO, MDY"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"standard_conforming_strings","Value":"on"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"session_authorization","Value":"postgres"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"client_encoding","Value":"UTF8"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"server_version","Value":"17.6"}
2025/09/18 01:39:25 PG Recv: {"Type":"ParameterStatus","Name":"server_encoding","Value":"UTF8"}
2025/09/18 01:39:25 PG Recv: {"Type":"BackendKeyData","ProcessID":208,"SecretKey":3786382219}
2025/09/18 01:39:25 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Initialising schema...
+ ulimit -n
+ '[' '!' -z '' ']'
+ export ERL_CRASH_DUMP=/tmp/erl_crash.dump
+ ERL_CRASH_DUMP=/tmp/erl_crash.dump
+ '[' false = true ']'
+ [[ -n '' ]]
+ echo 'Running migrations'
+ sudo -E -u nobody /app/bin/migrate
+ '[' true = true ']'
+ echo 'Seeding selfhosted Realtime'
+ sudo -E -u nobody /app/bin/realtime eval 'Realtime.Release.seeds(Realtime.Repo)'
[os_mon] memory supervisor port (memsup): Erlang has closed
[os_mon] cpu supervisor port (cpu_sup): Erlang has closed
+ echo 'Starting Realtime'
+ ulimit -n
+ exec /app/bin/realtime eval '{:ok, _} = Application.ensure_all_started(:realtime)
{:ok, _} = Realtime.Tenants.health_check("realtime-dev")'
[os_mon] memory supervisor port (memsup): Erlang has closed
[os_mon] cpu supervisor port (cpu_sup): Erlang has closed
Seeding globals from roles.sql...
2025/09/18 01:39:35 PG Send: {"Type":"Query","String":"CREATE DATABASE contrib_regression TEMPLATE postgres"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE DATABASE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
2025/09/18 01:39:35 PG Send: {"Type":"Terminate"}
Creating local database from declarative schemas:
 • supabase/schemas/01_extensions.sql
 • supabase/schemas/02_table_profiles.sql
 • supabase/schemas/03_table_medias.sql
 • supabase/schemas/04_table_membres_equipe.sql
 • supabase/schemas/05_table_lieux.sql
 • supabase/schemas/06_table_spectacles.sql
 • supabase/schemas/07_table_evenements.sql
 • supabase/schemas/07b_table_compagnie_content.sql
 • supabase/schemas/07c_table_compagnie_presentation.sql
 • supabase/schemas/07d_table_home_hero.sql
 • supabase/schemas/08_table_articles_presse.sql
 • supabase/schemas/08b_communiques_presse.sql
 • supabase/schemas/09_table_partners.sql
 • supabase/schemas/10_tables_system.sql
 • supabase/schemas/11_tables_relations.sql
 • supabase/schemas/12_evenements_recurrence.sql
 • supabase/schemas/13_analytics_events.sql
 • supabase/schemas/14_categories_tags.sql
 • supabase/schemas/15_content_versioning.sql
 • supabase/schemas/16_seo_metadata.sql
 • supabase/schemas/20_functions_core.sql
 • supabase/schemas/21_functions_auth_sync.sql
 • supabase/schemas/30_triggers.sql
 • supabase/schemas/40_indexes.sql
 • supabase/schemas/50_constraints.sql
 • supabase/schemas/60_rls_profiles.sql
 • supabase/schemas/61_rls_main_tables.sql
 • supabase/schemas/62_rls_advanced_tables.sql
2025/09/18 01:39:35 PG Send: {"Type":"StartupMessage","ProtocolVersion":196608,"Parameters":{"database":"contrib_regression","user":"postgres"}}
2025/09/18 01:39:35 PG Recv: {"Type":"AuthenticationSASL","AuthMechanisms":["SCRAM-SHA-256"]}
2025/09/18 01:39:35 PG Send: {"Type":"SASLInitialResponse","AuthMechanism":"SCRAM-SHA-256","Data":"n,,n=,r=/s2kJQ65nj7DtbLw4yZJ/Uy4"}
2025/09/18 01:39:35 PG Recv: {"Type":"AuthenticationSASLContinue","Data":"r=/s2kJQ65nj7DtbLw4yZJ/Uy4fSBOMT0U9GV1NXbIuEL1FFWy,s=jAidVxT9erGDZGFaUIhQkg==,i=4096"}
2025/09/18 01:39:35 PG Send: {"Type":"SASLResponse","Data":"c=biws,r=/s2kJQ65nj7DtbLw4yZJ/Uy4fSBOMT0U9GV1NXbIuEL1FFWy,p=W2mFPHUbzkgpYEcVndu5EYwnpx+gkX9TepGDnIeef6g="}
2025/09/18 01:39:35 PG Recv: {"Type":"AuthenticationSASLFinal","Data":"v=9uBsqJJrYff6jUQfrsVdkAtJ80P3d1Ew0BGu8S0cLa4="}
2025/09/18 01:39:35 PG Recv: {"Type":"AuthenticationOK"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"in_hot_standby","Value":"off"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"integer_datetimes","Value":"on"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"TimeZone","Value":"UTC"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"IntervalStyle","Value":"postgres"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"is_superuser","Value":"off"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"application_name","Value":""}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"default_transaction_read_only","Value":"off"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"scram_iterations","Value":"4096"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"DateStyle","Value":"ISO, MDY"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"standard_conforming_strings","Value":"on"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"session_authorization","Value":"postgres"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"client_encoding","Value":"UTF8"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"server_version","Value":"17.6"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParameterStatus","Name":"server_encoding","Value":"UTF8"}
2025/09/18 01:39:35 PG Recv: {"Type":"BackendKeyData","ProcessID":242,"SecretKey":3332407630}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 01_extensions.sql...
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Extensions requises pour Rouge Cardinal Company\n-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires\n\ncreate extension if not exists \"pgcrypto\"","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Génération UUID optionnelle\ncreate extension if not exists \"unaccent\"","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Pour generate_slug()\ncreate extension if not exists \"pg_trgm\"","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Index trigram pour recherche fuzzy\ncreate extension if not exists \"citext\"","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Case-insensitive text pour emails","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Sync"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"42710","Message":"extension \"pgcrypto\" already exists, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"extension.c","Line":1791,"Routine":"CreateExtension","UnknownFields":null}
NOTICE (42710): extension "pgcrypto" already exists, skipping
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"EmptyQueryResponse"}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 02_table_profiles.sql...
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Table profiles - Profils utilisateurs\n-- Ordre: 02 - Table de base sans dépendances\n\ndrop table if exists public.profiles cascade","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create table public.profiles (\n  id bigint generated always as identity primary key,\n  user_id uuid null,\n  display_name text,\n  slug text,\n  bio text,\n  avatar_media_id bigint null,\n  role text default 'user',\n  metadata jsonb default '{}'::jsonb,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null,\n  constraint profiles_userid_unique unique (user_id)\n)","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata'","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase'","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Sync"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"profiles\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "profiles" does not exist, skipping
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 03_table_medias.sql...
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Table medias - Gestion des médias/fichiers\n-- Ordre: 03 - Table de base sans dépendances\n\ndrop table if exists public.medias cascade","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create table public.medias (\n  id bigint generated always as identity primary key,\n  storage_path text not null,\n  filename text,\n  mime text,\n  size_bytes bigint,\n  alt_text text,\n  metadata jsonb default '{}'::jsonb,\n  uploaded_by uuid null,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null\n)","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)'","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"medias\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "medias" does not exist, skipping
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on column public.medias.storage_path is 'storage provider path (bucket/key)'","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Sync"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 04_table_membres_equipe.sql...
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Table membres_equipe - Membres de l'équipe\n-- Ordre: 04 - Dépend de medias pour photo_media_id\n\ndrop table if exists public.membres_equipe cascade","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create table public.membres_equipe (\n  id bigint generated always as identity primary key,\n  name text not null,\n  role text,\n  description text,\n  image_url text, -- URL d'image externe optionnelle (complément à photo_media_id)\n  photo_media_id bigint null references public.medias(id) on delete set null,\n  ordre smallint default 0,\n  active boolean default true,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null\n)","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.membres_equipe is 'Members of the team (artists, staff). image_url permet d\\'utiliser une image externe sans media uploadé.';\ncomment on column public.membres_equipe.image_url is 'URL externe de l\\'image du membre (fallback si aucun media stocké)';\n\n-- Row Level Security\nalter table public.membres_equipe enable row level security;\n\n-- Tout le monde peut voir les membres d'équipe\ndrop policy if exists \"Membres equipe are viewable by everyone\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Membres equipe are viewable by everyone\"\non public.membres_equipe\nfor select\nto anon, authenticated\nusing ( true )","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Seuls les admins peuvent gérer les membres d'équipe\ndrop policy if exists \"Admins can create membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can create membres equipe\"\non public.membres_equipe\nfor insert\nto authenticated\nwith check ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"drop policy if exists \"Admins can update membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can update membres equipe\"\non public.membres_equipe\nfor update\nto authenticated\nusing ( (select public.is_admin()) )\nwith check ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"drop policy if exists \"Admins can delete membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can delete membres equipe\"\non public.membres_equipe\nfor delete\nto authenticated\nusing ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"membres_equipe\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "membres_equipe" does not exist, skipping
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"-- Vue admin enrichie avec info versioning (dernière version + compte)\ncreate or replace view public.membres_equipe_admin as\nselect \n  m.id,\n  m.name,\n  m.role,\n  m.description,\n  m.image_url,\n  m.photo_media_id,\n  m.ordre,\n  m.active,\n  m.created_at,\n  m.updated_at,\n  cv.version_number as last_version_number,\n  cv.change_type as last_change_type,\n  cv.created_at as last_version_created_at,\n  vcount.total_versions\nfrom public.membres_equipe m\nleft join lateral (\n  select version_number, change_type, created_at\n  from public.content_versions\n  where entity_type = 'membre_equipe' and entity_id = m.id\n  order by version_number desc\n  limit 1\n) cv on true\nleft join lateral (\n  select count(*)::integer as total_versions\n  from public.content_versions\n  where entity_type = 'membre_equipe' and entity_id = m.id\n) vcount on true","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Parse","Name":"","Query":"comment on view public.membres_equipe_admin is 'Vue d\\'administration des membres avec métadonnées de versioning (dernière version et total).';","ParameterOIDs":null}
2025/09/18 01:39:35 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:39:35 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:39:35 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:39:35 PG Send: {"Type":"Sync"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:39:35 PG Recv: {"Type":"NoData"}
2025/09/18 01:39:35 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:39:35 PG Recv: {"Type":"ErrorResponse","Severity":"ERROR","SeverityUnlocalized":"ERROR","Code":"42601","Message":"syntax error at or near \"utiliser\"","Detail":"","Hint":"","Position":102,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"scan.l","Line":1244,"Routine":"scanner_yyerror","UnknownFields":null}
2025/09/18 01:39:35 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
2025/09/18 01:39:35 PG Send: {"Type":"Terminate"}
ERROR: syntax error at or near "utiliser" (SQLSTATE 42601)                                                                                           
At statement: 2                                                                                                                                      
comment on table public.membres_equipe is 'Members of the team (artists, staff). image_url permet d\'utiliser une image externe sans media uploadé.';
                                                                                                     ^    
```

```bash
################################################################################

yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase db diff -f apply_declarative_schema --debug
Using project host: supabase.co
Supabase CLI 2.40.7
Creating shadow database...
Skipping migration README-migrations.md... (file name must match pattern "<timestamp>_name.sql")
Skipping migration sync_existing_profiles.sql... (file name must match pattern "<timestamp>_name.sql")
2025/09/18 01:47:30 PG Send: {"Type":"StartupMessage","ProtocolVersion":196608,"Parameters":{"database":"postgres","user":"postgres"}}
2025/09/18 01:47:30 PG Recv: {"Type":"AuthenticationSASL","AuthMechanisms":["SCRAM-SHA-256"]}
2025/09/18 01:47:30 PG Send: {"Type":"SASLInitialResponse","AuthMechanism":"SCRAM-SHA-256","Data":"n,,n=,r=I7fUb2Q3sgs9d3MVdPzIGDsa"}
2025/09/18 01:47:30 PG Recv: {"Type":"AuthenticationSASLContinue","Data":"r=I7fUb2Q3sgs9d3MVdPzIGDsaz88nxE4rEqP0zs7OYuKll9S+,s=LuPJsAMyECTSxmN9P+I/Ag==,i=4096"}
2025/09/18 01:47:30 PG Send: {"Type":"SASLResponse","Data":"c=biws,r=I7fUb2Q3sgs9d3MVdPzIGDsaz88nxE4rEqP0zs7OYuKll9S+,p=twK0FTRROXw0pJMK6V89bKVwL6fZ461bkb2zRuUyEiE="}
2025/09/18 01:47:30 PG Recv: {"Type":"AuthenticationSASLFinal","Data":"v=Qo+hV+zWcBOoAOfAPIhAzZmuQhHB4W1vib6fGRbM6do="}
2025/09/18 01:47:30 PG Recv: {"Type":"AuthenticationOK"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"in_hot_standby","Value":"off"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"integer_datetimes","Value":"on"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"TimeZone","Value":"UTC"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"IntervalStyle","Value":"postgres"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"is_superuser","Value":"off"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"application_name","Value":""}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"default_transaction_read_only","Value":"off"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"scram_iterations","Value":"4096"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"DateStyle","Value":"ISO, MDY"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"standard_conforming_strings","Value":"on"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"session_authorization","Value":"postgres"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"client_encoding","Value":"UTF8"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"server_version","Value":"17.6"}
2025/09/18 01:47:30 PG Recv: {"Type":"ParameterStatus","Name":"server_encoding","Value":"UTF8"}
2025/09/18 01:47:30 PG Recv: {"Type":"BackendKeyData","ProcessID":207,"SecretKey":3667810444}
2025/09/18 01:47:30 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Initialising schema...
+ ulimit -n
+ '[' '!' -z '' ']'
+ export ERL_CRASH_DUMP=/tmp/erl_crash.dump
+ ERL_CRASH_DUMP=/tmp/erl_crash.dump
+ '[' false = true ']'
+ [[ -n '' ]]
+ echo 'Running migrations'
+ sudo -E -u nobody /app/bin/migrate
+ '[' true = true ']'
+ echo 'Seeding selfhosted Realtime'
+ sudo -E -u nobody /app/bin/realtime eval 'Realtime.Release.seeds(Realtime.Repo)'
[os_mon] memory supervisor port (memsup): Erlang has closed
[os_mon] cpu supervisor port (cpu_sup): Erlang has closed
+ echo 'Starting Realtime'
+ ulimit -n
+ exec /app/bin/realtime eval '{:ok, _} = Application.ensure_all_started(:realtime)
{:ok, _} = Realtime.Tenants.health_check("realtime-dev")'
[os_mon] memory supervisor port (memsup): Erlang has closed
[os_mon] cpu supervisor port (cpu_sup): Erlang has closed
Seeding globals from roles.sql...
2025/09/18 01:47:39 PG Send: {"Type":"Query","String":"CREATE DATABASE contrib_regression TEMPLATE postgres"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE DATABASE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
2025/09/18 01:47:39 PG Send: {"Type":"Terminate"}
Creating local database from declarative schemas:
 • supabase/schemas/01_extensions.sql
 • supabase/schemas/02_table_profiles.sql
 • supabase/schemas/03_table_medias.sql
 • supabase/schemas/04_table_membres_equipe.sql
 • supabase/schemas/05_table_lieux.sql
 • supabase/schemas/06_table_spectacles.sql
 • supabase/schemas/07_table_evenements.sql
 • supabase/schemas/07b_table_compagnie_content.sql
 • supabase/schemas/07c_table_compagnie_presentation.sql
 • supabase/schemas/07d_table_home_hero.sql
 • supabase/schemas/08_table_articles_presse.sql
 • supabase/schemas/08b_communiques_presse.sql
 • supabase/schemas/09_table_partners.sql
 • supabase/schemas/10_tables_system.sql
 • supabase/schemas/11_tables_relations.sql
 • supabase/schemas/12_evenements_recurrence.sql
 • supabase/schemas/13_analytics_events.sql
 • supabase/schemas/14_categories_tags.sql
 • supabase/schemas/15_content_versioning.sql
 • supabase/schemas/16_seo_metadata.sql
 • supabase/schemas/20_functions_core.sql
 • supabase/schemas/21_functions_auth_sync.sql
 • supabase/schemas/30_triggers.sql
 • supabase/schemas/40_indexes.sql
 • supabase/schemas/50_constraints.sql
 • supabase/schemas/60_rls_profiles.sql
 • supabase/schemas/61_rls_main_tables.sql
 • supabase/schemas/62_rls_advanced_tables.sql
2025/09/18 01:47:39 PG Send: {"Type":"StartupMessage","ProtocolVersion":196608,"Parameters":{"database":"contrib_regression","user":"postgres"}}
2025/09/18 01:47:39 PG Recv: {"Type":"AuthenticationSASL","AuthMechanisms":["SCRAM-SHA-256"]}
2025/09/18 01:47:39 PG Send: {"Type":"SASLInitialResponse","AuthMechanism":"SCRAM-SHA-256","Data":"n,,n=,r=Bge5Uqia5xoM/I2iakjByZeL"}
2025/09/18 01:47:39 PG Recv: {"Type":"AuthenticationSASLContinue","Data":"r=Bge5Uqia5xoM/I2iakjByZeLK4RnnBfb59ansMd7p1EgMI17,s=LuPJsAMyECTSxmN9P+I/Ag==,i=4096"}
2025/09/18 01:47:39 PG Send: {"Type":"SASLResponse","Data":"c=biws,r=Bge5Uqia5xoM/I2iakjByZeLK4RnnBfb59ansMd7p1EgMI17,p=F319/fp3UYGwvnobK+AHEzXJNeBQrx0Ne/Yn4/7wxhQ="}
2025/09/18 01:47:39 PG Recv: {"Type":"AuthenticationSASLFinal","Data":"v=5cYO9nt5KpFJl6WomK8FP3azaOWFlmghXXfQRfNstlo="}
2025/09/18 01:47:39 PG Recv: {"Type":"AuthenticationOK"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"in_hot_standby","Value":"off"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"integer_datetimes","Value":"on"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"TimeZone","Value":"UTC"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"IntervalStyle","Value":"postgres"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"is_superuser","Value":"off"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"application_name","Value":""}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"default_transaction_read_only","Value":"off"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"scram_iterations","Value":"4096"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"DateStyle","Value":"ISO, MDY"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"standard_conforming_strings","Value":"on"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"session_authorization","Value":"postgres"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"client_encoding","Value":"UTF8"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"server_version","Value":"17.6"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParameterStatus","Name":"server_encoding","Value":"UTF8"}
2025/09/18 01:47:39 PG Recv: {"Type":"BackendKeyData","ProcessID":234,"SecretKey":3743908800}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 01_extensions.sql...
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Extensions requises pour Rouge Cardinal Company\n-- Ordre: 01 - Exécuté en premier pour définir les extensions nécessaires\n\ncreate extension if not exists \"pgcrypto\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Génération UUID optionnelle\ncreate extension if not exists \"unaccent\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Pour generate_slug()\ncreate extension if not exists \"pg_trgm\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Index trigram pour recherche fuzzy\ncreate extension if not exists \"citext\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Case-insensitive text pour emails","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Sync"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"42710","Message":"extension \"pgcrypto\" already exists, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"extension.c","Line":1791,"Routine":"CreateExtension","UnknownFields":null}
NOTICE (42710): extension "pgcrypto" already exists, skipping
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE EXTENSION"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"EmptyQueryResponse"}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 02_table_profiles.sql...
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Table profiles - Profils utilisateurs\n-- Ordre: 02 - Table de base sans dépendances\n\ndrop table if exists public.profiles cascade","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create table public.profiles (\n  id bigint generated always as identity primary key,\n  user_id uuid null,\n  display_name text,\n  slug text,\n  bio text,\n  avatar_media_id bigint null,\n  role text default 'user',\n  metadata jsonb default '{}'::jsonb,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null,\n  constraint profiles_userid_unique unique (user_id)\n)","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.profiles is 'user profiles linked to auth.users; contains display info and role metadata'","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on column public.profiles.user_id is 'references auth.users.id managed by Supabase'","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Sync"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"profiles\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "profiles" does not exist, skipping
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 03_table_medias.sql...
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Table medias - Gestion des médias/fichiers\n-- Ordre: 03 - Table de base sans dépendances\n\ndrop table if exists public.medias cascade","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create table public.medias (\n  id bigint generated always as identity primary key,\n  storage_path text not null,\n  filename text,\n  mime text,\n  size_bytes bigint,\n  alt_text text,\n  metadata jsonb default '{}'::jsonb,\n  uploaded_by uuid null,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null\n)","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.medias is 'media storage metadata (paths, filenames, mime, size)'","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"medias\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "medias" does not exist, skipping
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on column public.medias.storage_path is 'storage provider path (bucket/key)'","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Sync"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"COMMENT"}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
Seeding globals from 04_table_membres_equipe.sql...
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Table membres_equipe - Membres de l'équipe\n-- Ordre: 04 - Dépend de medias pour photo_media_id\n\ndrop table if exists public.membres_equipe cascade","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create table public.membres_equipe (\n  id bigint generated always as identity primary key,\n  name text not null,\n  role text,\n  description text,\n  image_url text, -- URL d'image externe optionnelle (complément à photo_media_id)\n  photo_media_id bigint null references public.medias(id) on delete set null,\n  ordre smallint default 0,\n  active boolean default true,\n  created_at timestamptz default now() not null,\n  updated_at timestamptz default now() not null\n)","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on table public.membres_equipe is \"Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé.\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on column public.membres_equipe.image_url is \"URL externe de l image du membre (fallback si aucun media stocké)\"","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"00000","Message":"table \"membres_equipe\" does not exist, skipping","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"tablecmds.c","Line":1427,"Routine":"DropErrorMsgNonExistent","UnknownFields":null}
NOTICE (00000): table "membres_equipe" does not exist, skipping
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Row Level Security\nalter table public.membres_equipe enable row level security","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Tout le monde peut voir les membres d'équipe\ndrop policy if exists \"Membres equipe are viewable by everyone\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Membres equipe are viewable by everyone\"\non public.membres_equipe\nfor select\nto anon, authenticated\nusing ( true )","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Seuls les admins peuvent gérer les membres d'équipe\ndrop policy if exists \"Admins can create membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can create membres equipe\"\non public.membres_equipe\nfor insert\nto authenticated\nwith check ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"drop policy if exists \"Admins can update membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can update membres equipe\"\non public.membres_equipe\nfor update\nto authenticated\nusing ( (select public.is_admin()) )\nwith check ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"drop policy if exists \"Admins can delete membres equipe\" on public.membres_equipe","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"create policy \"Admins can delete membres equipe\"\non public.membres_equipe\nfor delete\nto authenticated\nusing ( (select public.is_admin()) )","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"-- Vue admin enrichie avec info versioning (dernière version + compte)\ncreate or replace view public.membres_equipe_admin as\nselect \n  m.id,\n  m.name,\n  m.role,\n  m.description,\n  m.image_url,\n  m.photo_media_id,\n  m.ordre,\n  m.active,\n  m.created_at,\n  m.updated_at,\n  cv.version_number as last_version_number,\n  cv.change_type as last_change_type,\n  cv.created_at as last_version_created_at,\n  vcount.total_versions\nfrom public.membres_equipe m\nleft join lateral (\n  select version_number, change_type, created_at\n  from public.content_versions\n  where entity_type = 'membre_equipe' and entity_id = m.id\n  order by version_number desc\n  limit 1\n) cv on true\nleft join lateral (\n  select count(*)::integer as total_versions\n  from public.content_versions\n  where entity_type = 'membre_equipe' and entity_id = m.id\n) vcount on true","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Parse","Name":"","Query":"comment on view public.membres_equipe_admin is 'Vue d\\'administration des membres avec métadonnées de versioning (dernière version et total).';","ParameterOIDs":null}
2025/09/18 01:47:39 PG Send: {"Type":"Bind","DestinationPortal":"","PreparedStatement":"","ParameterFormatCodes":null,"Parameters":[],"ResultFormatCodes":[]}
2025/09/18 01:47:39 PG Send: {"Type":"Describe","ObjectType":"P","Name":""}
2025/09/18 01:47:39 PG Send: {"Type":"Execute","Portal":"","MaxRows":0}
2025/09/18 01:47:39 PG Send: {"Type":"Sync"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"DROP TABLE"}
2025/09/18 01:47:39 PG Recv: {"Type":"ParseComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"BindComplete"}
2025/09/18 01:47:39 PG Recv: {"Type":"NoData"}
2025/09/18 01:47:39 PG Recv: {"Type":"CommandComplete","CommandTag":"CREATE TABLE"}
2025/09/18 01:47:39 PG Recv: {"Severity":"NOTICE","SeverityUnlocalized":"NOTICE","Code":"42622","Message":"identifier \"Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé.\" will be truncated to \"Members of the team (artists, staff). image_url permet d  utili\"","Detail":"","Hint":"","Position":0,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"scansup.c","Line":99,"Routine":"truncate_identifier","UnknownFields":null}
NOTICE (42622): identifier "Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé." will be truncated to "Members of the team (artists, staff). image_url permet d  utili"
2025/09/18 01:47:39 PG Recv: {"Type":"ErrorResponse","Severity":"ERROR","SeverityUnlocalized":"ERROR","Code":"42601","Message":"syntax error at or near \"\"Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé.\"\"","Detail":"","Hint":"","Position":43,"InternalPosition":0,"InternalQuery":"","Where":"","SchemaName":"","TableName":"","ColumnName":"","DataTypeName":"","ConstraintName":"","File":"scan.l","Line":1244,"Routine":"scanner_yyerror","UnknownFields":null}
2025/09/18 01:47:39 PG Recv: {"Type":"ReadyForQuery","TxStatus":"I"}
2025/09/18 01:47:39 PG Send: {"Type":"Terminate"}
ERROR: syntax error at or near ""Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé."" (SQLSTATE 42601)
At statement: 2                                                                                                                                             
comment on table public.membres_equipe is "Members of the team (artists, staff). image_url permet d  utiliser une image externe sans media uploadé."        
                                          ^
```

```bash
####################################################################################

ERROR: relation "public.communiques_medias" does not exist (SQLSTATE 42P01)
At statement: 29
-- ===== VUES UTILITAIRES =====

-- Vue pour affichage public des communiqués (espace presse professionnel)
create or replace view public.communiques_presse_public as
select
  cp.id,
  cp.title,
  cp.slug,
  cp.description,
  cp.date_publication,
  cp.ordre_affichage,
  cp.spectacle_id,
  cp.evenement_id,
  -- Informations du PDF principal (ordre = -1)
  pdf_m.filename as pdf_filename,
  cp.file_size_bytes,
  case
    when cp.file_size_bytes is not null then
      case
        when cp.file_size_bytes < 1024 then cp.file_size_bytes::text || ' B'
        when cp.file_size_bytes < 1048576 then round(cp.file_size_bytes / 1024.0, 1)::text || ' KB'
        else round(cp.file_size_bytes / 1048576.0, 1)::text || ' MB'
      end
    else pdf_m.size_bytes::text
  end as file_size_display,
  pdf_m.storage_path as pdf_path,
  -- URL public pour téléchargement (via Supabase Storage)
  concat('/storage/v1/object/public/', pdf_m.storage_path) as file_url,
  -- Informations image d'illustration
  cp.image_url,
  cm.ordre as image_ordre,
  im.filename as image_filename,
  im.storage_path as image_path,
  concat('/storage/v1/object/public/', im.storage_path) as image_file_url,
  -- Informations contextuelles
  s.title as spectacle_titre,
  e.date_debut as evenement_date,
  l.nom as lieu_nom,
  -- Catégories et tags
  array_agg(distinct c.name) filter (where c.name is not null) as categories,
  array_agg(distinct t.name) filter (where t.name is not null) as tags
from public.communiques_presse cp
left join public.communiques_medias pdf_cm on cp.id = pdf_cm.communique_id and pdf_cm.ordre = -1 -- PDF principal
      ^

```bash
####################################################################################

"refactor(schema): stabilize declarative schema order, fix SQL quoting, move views; rename reserved column

- Add 02b_functions_core.sql defining public.is_admin() and core helpers right after profiles; neutralize 20_functions_core.sql to avoid redefinitions
- Fix SQL comment quoting (use single quotes + escaping) in 04_table_membres_equipe.sql and 10_tables_system.sql
- Move admin views referencing public.content_versions into 41_views_admin_content_versions.sql (created after the versioning table)
- Move press-release views from 08b_communiques_presse.sql to 41_views_communiques.sql (created after relations like public.communiques_medias).
- Rename reserved column public.spectacles.cast to casting in 06_table_spectacles.sql, and document the field purpose
- Ensure creation order resolves missing relation errors (content_versions, communiques_medias) by deferring dependent views to 41_* files.
- BREAKING CHANGE: column public.spectacles.cast renamed to casting. Update queries, views, and application code accordingly"

```

```bash
####################################################################################

ERROR: relation "public.categories" does not exist (SQLSTATE 42P01)                        
At statement: 7                                                                            
create table public.communiques_categories (                                               
  communique_id bigint not null references public.communiques_presse(id) on delete cascade,
  category_id bigint not null references public.categories(id) on delete cascade,          
  primary key (communique_id, category_id)                                                 
)

# pnpm dlx supabase db diff -f apply_declarative_schema --debug

ERROR: syntax error at or near "not" (SQLSTATE 42601)
At statement: 2                                      
-- Contrainte anti-récursion pour événements         
alter table public.evenements                        
add constraint if not exists check_no_self_parent

# pnpm dlx supabase db diff -f apply_declarative_schema --debug

ERROR: cannot use subquery in check constraint (SQLSTATE 0A000)              
At statement: 11                                                             
alter table public.evenements                                                
add constraint check_valid_event_types                                       
check (                                                                      
  type_array is null or                                                      
  array_length(type_array, 1) is null or                                     
  (                                                                          
    array_length(type_array, 1) > 0 and                                      
    not exists (                                                             
      select 1 from unnest(type_array) as t(type)                            
      where t.type not in (                                                  
        'spectacle', 'première', 'premiere', 'atelier', 'workshop',          
        'rencontre', 'conference', 'masterclass', 'répétition', 'repetition',
        'audition', 'casting', 'formation', 'residency', 'résidence'         
      )                                                                      
    )                                                                        
  )                                                                          
)

# pnpm dlx supabase db diff -f apply_declarative_schema --debug

ERROR: DELETE trigger's WHEN condition cannot reference NEW values (SQLSTATE 42P17)
At statement: 24                                                                   
create trigger trg_check_communique_pdf                                            
  before insert or update or delete on public.communiques_medias                   
  for each row                                                                     
  when (NEW.ordre = -1 or OLD.ordre = -1 or (NEW is null and OLD.ordre = -1))

```

```bash
####################################################################################
# pnpm dlx supabase db diff -f apply_declarative_schema --debug


Status: Downloaded newer image for public.ecr.aws/supabase/migra:3.0.1663481299
Finished supabase db diff on branch master.

WARNING: The diff tool is not foolproof, so you may need to manually rearrange and modify the generated migration.
Run supabase db reset to verify that the new migration does not generate errors.
2025/09/18 02:48:49 HTTP GET: https://api.github.com/repos/supabase/cli/releases/latest
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase db reset --no-confirm --debug
Usage:
  supabase db reset [flags]

Flags:
      --db-url string    Resets the database specified by the connection string (must be percent-encoded).
  -h, --help             help for reset
      --last uint        Reset up to the last n migration versions.
      --linked           Resets the linked project with local migrations.
      --local            Resets the local database with local migrations. (default true)
      --no-seed          Skip running the seed script after reset.
      --version string   Reset up to the specified version.

Global Flags:
      --create-ticket                                  create a support ticket for any CLI error
      --debug                                          output debug logs to stderr
      --dns-resolver [ native | https ]                lookup domain names using the specified resolver (default native)
      --experimental                                   enable experimental features
      --network-id string                              use the specified docker network instead of a generated one
  -o, --output [ env | pretty | json | toml | yaml ]   output format of status variables (default pretty)
      --profile string                                 use a specific profile for connecting to Supabase API (default "supabase")
      --workdir string                                 path to a Supabase project directory
      --yes                                            answer yes to all prompts

unknown flag: --no-confirm
Try rerunning the command with --debug to troubleshoot the error.
yandev@LAPTOP-CE57E7VI:~/projets/rougecardinalcompany$ pnpm dlx supabase db reset --local --no-seed --debug --yes
Using project host: supabase.co
Supabase CLI 2.40.7
supabase start is not running.
```

```bash
####################################################################################
# pnpm dlx supabase db diff -f apply_declarative_schema --debug
pnpm dlx supabase start --debug


Started supabase local development setup.

         API URL: http://127.0.0.1:54321
     GraphQL URL: http://127.0.0.1:54321/graphql/v1
  S3 Storage URL: http://127.0.0.1:54321/storage/v1/s3
          DB URL: postgresql://postgres:postgres@127.0.0.1:54322/postgres
      Studio URL: http://127.0.0.1:54323
    Inbucket URL: http://127.0.0.1:54324
      JWT secret: super-secret-jwt-token-with-at-least-32-characters-long
        anon key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
service_role key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU
   S3 Access Key: 625729a08b95bf1b7ff351a663f3a23c
   S3 Secret Key: 850181e4652dd023b7a98c58ae0d2d34bd487ee0cc3254a

```

```bash
####################################################################################

