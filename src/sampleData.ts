export const SAMPLE_ENTITIES_CSV = `id,name,type,meta
alice,Alice Müller,person,Engineering Manager
bob,Bob Tanaka,person,Senior Engineer
charlie,Charlie Lopez,person,Software Engineer
diana,Diana Chen,person,QA Engineer
eve,Eve Schmidt,person,Senior Engineer
frank,Frank Kim,person,Software Engineer
grace,Grace Obi,person,Product Manager
henry,Henry Weiss,person,Software Engineer
ivan,Ivan Petrov,person,Support Engineer
julia,Julia Santos,person,Support Engineer
kate,Kate Brown,person,Project Manager
lea,Lea Larsson,person,VP Engineering
project-alpha,Project Alpha,project,ClientCo
project-beta,Project Beta,project,internal
project-gamma,Project Gamma,project,RetailCorp
project-delta,Project Delta,project,internal
project-epsilon,Project Epsilon,project,TechStart
team-backend,Backend Team,squad,product
team-frontend,Frontend Team,squad,product
team-support,Support Team,squad,support
repo-api,example/api,repo,Core REST API
repo-web,example/web,repo,Frontend web app
repo-infra,example/infra,repo,Infrastructure & deployment`;

export const SAMPLE_CLAIMS_CSV = `subject,relation,object,detail,source,verified
alice,member-of,team-backend,,Wiki: /teams,2026-04-01
bob,member-of,team-backend,,Wiki: /teams,2026-04-01
charlie,member-of,team-backend,,Wiki: /teams,2026-04-01
diana,member-of,team-backend,,Wiki: /teams,2026-04-01
eve,member-of,team-frontend,,Wiki: /teams,2026-04-01
frank,member-of,team-frontend,,Wiki: /teams,2026-04-01
grace,member-of,team-frontend,,Wiki: /teams,2026-04-01
henry,member-of,team-frontend,,Wiki: /teams,2026-04-01
ivan,member-of,team-support,,Wiki: /teams,2026-04-01
julia,member-of,team-support,,Wiki: /teams,2026-04-01
kate,member-of,team-support,,Wiki: /teams,2026-04-01
bob,reports-to,alice,EM,Wiki: /org,2026-03-15
charlie,reports-to,alice,EM,Wiki: /org,2026-03-15
diana,reports-to,alice,EM,Wiki: /org,2026-03-15
frank,reports-to,eve,SL,Wiki: /org,2026-03-15
henry,reports-to,eve,SL,Wiki: /org,2026-03-15
grace,reports-to,lea,EM,Wiki: /org,2026-03-15
alice,reports-to,lea,EM,Wiki: /org,2026-03-15
eve,reports-to,lea,EM,Wiki: /org,2026-03-15
ivan,reports-to,kate,SL,Wiki: /org,2026-03-15
julia,reports-to,kate,SL,Wiki: /org,2026-03-15
project-alpha,owned-by,team-backend,,Wiki: /projects,2026-04-01
project-beta,owned-by,team-backend,,Wiki: /projects,2026-04-01
project-gamma,owned-by,team-frontend,,Wiki: /projects,2026-04-01
project-delta,owned-by,team-frontend,,Wiki: /projects,2026-04-01
project-epsilon,owned-by,team-support,,Wiki: /projects,2026-04-01
alice,works-on,project-alpha,TL,Wiki: /team/alpha,2026-04-01
bob,works-on,project-alpha,dev,Issue tracker,2026-04-01
charlie,works-on,project-alpha,dev,Issue tracker,2026-04-01
diana,works-on,project-alpha,QA,Issue tracker,2026-04-01
grace,works-on,project-alpha,PM,Wiki: /team/alpha,2026-04-01
alice,works-on,project-beta,TL,Wiki: /team/beta,2026-03-01
bob,works-on,project-beta,dev,Issue tracker,2026-03-01
diana,works-on,project-beta,QA,Issue tracker,2026-03-01
eve,works-on,project-gamma,TL,Wiki: /team/gamma,2026-04-10
frank,works-on,project-gamma,dev,Issue tracker,2026-04-10
grace,works-on,project-gamma,PM,Wiki: /team/gamma,2026-04-10
henry,works-on,project-gamma,dev,Issue tracker,2026-04-10
eve,works-on,project-delta,TL,Wiki: /team/delta,2026-02-01
frank,works-on,project-delta,dev,Issue tracker,2026-02-01
henry,works-on,project-delta,dev,Issue tracker,2026-02-01
ivan,works-on,project-epsilon,TL,Wiki: /team/epsilon,2026-01-15
julia,works-on,project-epsilon,dev,Issue tracker,2026-01-15
kate,works-on,project-epsilon,PM,Wiki: /team/epsilon,2026-01-15
alice,contributes-to,repo-api,,GitHub,2026-04-01
bob,contributes-to,repo-api,,GitHub,2026-04-01
charlie,contributes-to,repo-api,,GitHub,2026-04-01
eve,contributes-to,repo-web,,GitHub,2026-04-01
frank,contributes-to,repo-web,,GitHub,2026-04-01
henry,contributes-to,repo-web,,GitHub,2026-04-10
alice,contributes-to,repo-infra,,GitHub,2026-03-01
eve,contributes-to,repo-infra,,GitHub,2026-03-01
project-alpha,link,https://example.atlassian.net/browse/ALPHA,Jira: ALPHA,jira,
project-alpha,link,https://app.slack.com/client/T/C001,#project-alpha,slack,
project-alpha,link,https://github.com/example/project-alpha,example/project-alpha,github,
project-beta,link,https://example.atlassian.net/browse/BETA,Jira: BETA,jira,
project-beta,link,https://app.slack.com/client/T/C002,#project-beta,slack,
project-gamma,link,https://example.atlassian.net/browse/GAMMA,Jira: GAMMA,jira,
project-gamma,link,https://app.slack.com/client/T/C003,#project-gamma,slack,
project-gamma,link,https://example.com/gamma,Product page,website,
project-delta,link,https://example.atlassian.net/browse/DELTA,Jira: DELTA,jira,
project-epsilon,link,https://example.atlassian.net/browse/EPS,Jira: EPS,jira,
project-epsilon,link,https://app.slack.com/client/T/C004,#project-epsilon,slack,
team-backend,link,https://example.atlassian.net/wiki/backend,Backend Team Confluence,confluence,
team-backend,link,https://app.slack.com/client/T/C005,#team-backend,slack,
team-backend,link,https://app.slack.com/client/T/C006,#team-backend-dev,slack,
team-frontend,link,https://example.atlassian.net/wiki/frontend,Frontend Team Confluence,confluence,
team-frontend,link,https://app.slack.com/client/T/C007,#team-frontend,slack,
team-support,link,https://app.slack.com/client/T/C008,#team-support,slack,
repo-api,link,https://github.com/example/api,example/api,github,
repo-web,link,https://github.com/example/web,example/web,github,
repo-infra,link,https://github.com/example/infra,example/infra,github,`;
