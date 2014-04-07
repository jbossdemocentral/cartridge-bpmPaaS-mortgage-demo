#!/bin/bash
export JAVA_OPTS="-Djboss.management.client_socket_bind_address=$OPENSHIFT_BPMS_IP"
/usr/share/jbossas/bin/jboss-cli.sh "$@"
