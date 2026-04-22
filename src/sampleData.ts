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
team-support,Support Team,squad,support`;

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
kate,works-on,project-epsilon,PM,Wiki: /team/epsilon,2026-01-15`;

export const SAMPLE_LINKS_CSV = `entity_id,type,url,label
project-alpha,jira,https://example.atlassian.net/browse/ALPHA,Jira: ALPHA
project-alpha,slack,https://app.slack.com/client/T/C001,#project-alpha
project-alpha,github,https://github.com/example/project-alpha,example/project-alpha
project-beta,jira,https://example.atlassian.net/browse/BETA,Jira: BETA
project-beta,slack,https://app.slack.com/client/T/C002,#project-beta
project-gamma,jira,https://example.atlassian.net/browse/GAMMA,Jira: GAMMA
project-gamma,slack,https://app.slack.com/client/T/C003,#project-gamma
project-gamma,website,https://example.com/gamma,Product page
project-delta,jira,https://example.atlassian.net/browse/DELTA,Jira: DELTA
project-epsilon,jira,https://example.atlassian.net/browse/EPS,Jira: EPS
project-epsilon,slack,https://app.slack.com/client/T/C004,#project-epsilon
team-backend,confluence,https://example.atlassian.net/wiki/backend,Backend Team Confluence
team-backend,slack,https://app.slack.com/client/T/C005,#team-backend
team-backend,slack,https://app.slack.com/client/T/C006,#team-backend-dev
team-frontend,confluence,https://example.atlassian.net/wiki/frontend,Frontend Team Confluence
team-frontend,slack,https://app.slack.com/client/T/C007,#team-frontend
team-support,slack,https://app.slack.com/client/T/C008,#team-support`;
