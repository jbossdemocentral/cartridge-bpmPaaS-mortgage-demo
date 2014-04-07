## Cartridge for bpmPaaS with Mortgage Demo

Summary
-------
This cartridge provides the **_Red Hat JBoss BPM Suite_** for easy deployment to OpenShift based bpmPaaS with pre-loaded Mortgage Demo.

For more information on the [Mortgage Demo see here] (https://github.com/eschabell/bpms-mortgage-demo).

JBoss BPM Suite logins: 

   * u: erics  p: bpmsuite  (admin)

   * u: alan  p: bpmsuite  (appraiser)

   * u: mary p: bpmsuite (manager)

   * u: bob p: bpmsuite (broker)


Important Note
--------------
You need the ability to setup MEDIUM gears, which is freely available if you [upgrade your account to Bronze here] (https://www.openshift.com/products/pricing). 


Deployment
----------

To try out JBoss BPM Suite on OpenShift please follow the instructions:

If you want to use the [OpenShift create application page](https://openshift.redhat.com/app/console/application_types), enter the cartridge URI of **https://raw.githubusercontent.com/eschabell/cartridge-bpmPaaS-mortgage-demo/master/metadata/manifest.yml** in the entry field (at the bottom left of the form).

Or if you want to use the [rhc command line](https://www.openshift.com/developers/rhc-client-tools-install) type:

    rhc app create -g medium <APP NAME> https://raw.githubusercontent.com/eschabell/cartridge-bpmPaaS-mortgage-demo/master/metadata/manifest.yml

This will output the generated users and passwords for Business Central.

You can use them to login into Business Central or BAM applications.

