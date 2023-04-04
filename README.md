# daemon-job-k8s-crd
Meta Controller Custom Composite Controller to create the Daemonjob extending the Daemonset, 

Which will run on all available nodes once and remove POD

Article : https://medium.com/@harsh.manvar111/daemon-job-crd-in-k8s-with-compositecontroller-f263b7f25cb9

Install Metacontroller 

`kubectl apply -k https://github.com/metacontroller/metacontroller/manifests/production`

Apply CRD & Controller Deployment 

`kubectl apply -k manifest/`

Controller Code available at 

`data/src/`
