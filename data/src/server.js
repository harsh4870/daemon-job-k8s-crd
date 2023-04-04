const express = require("express");
const bodyParser = require('body-parser');

const PORT = 80;
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

function is_job_finished (job){
  if (!job['status']) {
    return false;
  }else{
    const { desiredNumberScheduled = 1, numberReady = 0 } = job['status'];
    if (desiredNumberScheduled === numberReady && desiredNumberScheduled > 0) {
      return true;
    }
  }
  return false;
}

function new_daemon(job) {
  const { metadata, spec } = JSON.parse(JSON.stringify(job));
  return {
    apiVersion: 'apps/v1',
    kind: 'DaemonSet',
    metadata: {
      name: metadata.name + '-dj',
      labels: spec.template.metadata.labels
    },
    spec: {
      template: {
        ...spec.template,
        spec: {
          ...spec.template.spec,
          containers: spec.template.spec.containers
        }
      },
      selector: { matchLabels: spec.template.metadata.labels }
    }
  };
}

app.post("/sync", (req, res) => {

    function sync(job, children){
      desired_status = {}
      child = job.metadata.name + '-dj'

      if (is_job_finished(job)){
        desired_status = job['status']
        desired_status['conditions'] = [{'type': 'Complete', 'status': 'True'}]
        return {'status': desired_status, 'children': []}
      }

      if(children['DaemonSet.apps/v1'] && children['DaemonSet.apps/v1'][child] && children['DaemonSet.apps/v1'][child]['status']){
        desired_status = children['DaemonSet.apps/v1'][child]['status']
        if(is_job_finished(children['DaemonSet.apps/v1'][child])){
          desired_status['conditions'] = [{'type': 'Complete', 'status': 'True'}]
        }else{
          desired_status['conditions'] = [{'type': 'Complete', 'status': 'False'}]
        }
      }
      desired_child = new_daemon(job)
      return {'status': desired_status, 'children': [desired_child]}
    }

    try {
        let observed = req.body;
        let desired = sync(observed.parent, observed.children)
        res.status(200).send(desired)
    } catch (e) {
        console.log(e.stack)
        res.status(500).send({ body: e.stack })
    }
});

app.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});