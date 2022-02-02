# lead-routing microservice

## Installation
1. Install `Node.JS v12.**.**`, `NPM v6.**.**`, `GIT v2.**.**`, `MySQL Server 5.7`;
1. Share your Git account with Leadrouting responsible developer;
1. Clone the repository  with `git clone git@github.com:KWRI/leadrouting-micro.git *************` command;
1. Run `npm install`;
1. Create `.env` file and fill it with next variables `KWC_URL`, `PEOPLE_API_KEY`, `PEOPLE_ENDPOINT`, `CONSUMER_API_KEY`, etc (for details refer to Leadrouting responsible developer);
1. [Optional] Install `Redis server`;
1. [Optional] Create GCP account:
    a.  Create Pub/Sub topic (twice);
    b. Create Pub/Sub subscripton (twice);
1. Inside of installed MySQL server create `lead_routing` database;
1. Run database migrations with `npm run db:migrate` command.
1. [Optional] Set the lightstep tracing:
    Add `LIGHTSTEP_TOKEN` and `DD_TRACE_GLOBALIGHTSTEP_URLL_TAGS` environment variables with the values from Lightstep.
