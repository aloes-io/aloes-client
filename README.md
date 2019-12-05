# Aloes - Frontend Client

Cient application based on :

- [VueJS](https://vuejs.org/) view framework

- [Bootstrap](http://getbootstrap.com/) component library

- [Vue-cli](https://cli.vuejs.org/) application builder

---

## Folder structure

- /.  --> Main application configuration, dependencies list, and launch scripts 

- /deploy --> contains environment variables ( hidden files )

- /public --> contains icons, fonts ... 

- /src --> contains source code 
	- /.  -->  VueJS main configuration and boot scripts
	- /components --> micro view components called by main components
	- /modules --> scripts used to handle data flow into the web application
	- /services --> scripts to handle connections with the backend
	- /styles --> css files for every components
	- /views --> landing pages and main components

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Run your unit tests
```
yarn test:unit
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## Deploying project

### With PM2 
You can serve the project with a distant server by filling `deploy` folder with files corresponding to an environment ( eg: .env_production ), and then launching this app with pm2 via `ecosystem.config.json` 

Remember to update `ecosystem.config.json` to match your enviroment.

- Access to server with SSH :

```bash
	$  ssh-keygen -f ~/.ssh/server_name -t rsa -C <email_address> -b 4096
	$  ssh-copy-id -i ~/.ssh/server_name user@server_uri
```

Creating environment :

```bash
	$  pm2 deploy ecosystem.config.js production setup
```

Updating environment :

```bash
	$  pm2 deploy ecosystem.config.js production update
```

Be sure to commit your changes on the right branch before setup and update: ( master for production env, and staging for dev/staging env )

```bash
	$  git checkout master
	$  git add .
	$  git commit .
	$  git push
```

### With Docker 
You can serve the project with a distant server by filling `deploy` folder with files corresponding to an environment ( eg: .env_docker ), and then launching this app with docker via `docker-compose up` 

Remember to update `*.dockerfile` to match your enviroment.


Creating environment :

```bash
	$  yarn build:docker
```

Starting container :

```bash
	$  yarn start:docker
```


# TODO 

- Add a grid to compose views with sensor snaps ( sensors selector, add group container, draggable snaps, list of grids )
- Add unit and e2e tests
- Add docs
- Manage teams to share devices and applications access

