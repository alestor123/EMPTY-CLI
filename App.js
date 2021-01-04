#!/usr/bin/env node

var axios = require('axios'),
options =  require('minimist')(process.argv.slice(2)),
chalk = require('chalk'),
username = options.username || options.u,
token = options.token || options.t,
api = 'https://api.github.com/graphql';
(async () => {

if(options.token || options.t) axios.defaults.headers.common['Authorization'] = `bearer ${token}`;
else throw new Error('Token not found')
var repos = await axios.post(api, 
    {query: 
        `
query ($cursor: String) {
    user(login: "${username}") {
        repositories(
            last: 100,
            isFork: false,
            isLocked: false,
            ownerAffiliations: OWNER,
            privacy: PUBLIC,
            orderBy: {
                field: CREATED_AT,
                direction: ASC
            }
            before: $cursor
        ) {
            edges {
                node {
                    name
                    description
                    url
                    primaryLanguage {
                        name
                        color
                    }
                    forks {
                        totalCount
                    }
                }
            }
        }
    }
}
`,variables: { login: username },}) 
console.log(chalk.red(`${username} 's empty repos`))
repos.data.data.user.repositories.edges.map(async name => {

var data = await axios.get(`https://api.github.com/repos/${username}/${name.node.name}`)
if(data.data.size==0) console.log(chalk.red.bgWhite(name.node.name))
})
})();
