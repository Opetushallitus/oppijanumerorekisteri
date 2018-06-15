source-to-image:
	mvn clean install -Dbranch=${BRANCH} -Drevision=${REVISION} -DbuildNumber=${BUILD_NUMBER}
