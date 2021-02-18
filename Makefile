
TAG    			:= $$(git describe --tags)
REGISTRY		:= registry.nersc.gov
PROJECT 		:= als
REGISTRY_NAME	:= ${REGISTRY}/${PROJECT}/${IMG}

NAME_WEB_SVC  	:= splash_client
IMG_WEB_SVC    		:= ${NAME_WEB_SVC}:${TAG}
REGISTRY_WEB_SVC	:= ${REGISTRY}/${PROJECT}/${NAME_WEB_SVC}:${TAG}



.PHONY: build_client

clean:
	@echo "Cleaning tree of build files"


build_client:
	@docker build -t ${IMG_WEB_SVC} -f Dockerfile .
	@echo "tagging to: " ${IMG_WEB_SVC}    ${REGISTRY_WEB_SVC}
	@docker tag ${IMG_WEB_SVC} ${REGISTRY_WEB_SVC}
 
push_client:
	@echo "Pushing " ${REGISTRY_WEB_SVC}
	@docker push ${REGISTRY_WEB_SVC}

run_client:
	@echo docker run -d -p 8081:80 ${REGISTRY_WEB_SVC}
	@docker run -d -p 8081:80 ${REGISTRY_WEB_SVC}

login:
	@docker log -u ${DOCKER_USER} -p ${DOCKER_PASS}