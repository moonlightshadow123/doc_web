from flask import Flask, jsonify, request, send_from_directory, render_template
from utils import addPath, getTraceLog
# from werkzeug.utils import secure_filename
import orm, json

UPLOAD_FOLDER = "../site/extra"

app = Flask(__name__, static_url_path='', static_folder="../site", template_folder="../site")  
# app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

## Page
@app.route("/index")
def index():
	projId = request.args.get("projId")
	projs = orm.getProjs()
	if not projId:
	 	return render_template('/index/index.html', jsonData={}, projs=projs, projId="") #JSON.parse('{{ user | tojson | safe}}');
	else:
		jsonData = orm.getProjJson(projId)
		return render_template('/index/index.html', jsonData=jsonData, projs=projs, projId=projId) #JSON.parse('{{ user | tojson | safe}}');

@app.route("/file")
def file():
	projId = request.args.get("projId")
	nodeId = request.args.get("nodeId")
	nodeType = request.args.get("nodeType")
	extraBaseUrl = orm.getExtraBaseUrl(projId)
	nodeJson = orm.getNodeJson(nodeId)
	print(nodeJson, extraBaseUrl)
	if nodeType == "md":
		return render_template('/md/md.html', data=json.dumps({"nodeId": nodeId, "content":nodeJson["content"], 
												"name": nodeJson["name"], "baseUrl":extraBaseUrl}))
	if nodeType == "deck":
		return render_template('/deck/deck.html', data=json.dumps({"nodeId": nodeId, "content":nodeJson["content"], 
												"name": nodeJson["name"], "baseUrl":extraBaseUrl}))

	return jsonify({"res":"res"})

def dbNewProj(name=""):
	nodeJson = orm.nodeAddNode(name)
	proj = orm.createProj(name, nodeJson)
	return proj.id

def dbDeleteProj(projId=""):
	rmIds = orm.deleteProj(projId)
	for rmId in rmIds:
		orm.nodeRmNode(rmId)

@app.route("/newProj")
def newProj():
	name = request.args.get("name")
	projId = orm.transaction(dbNewProj,name=name)
	if projId:
		projs = orm.getProjs()
		print(projs)
		return jsonify({"res": projs, "msg": "add File Succeed!"})
	else:
		return jsonify({"res": False, "msg": "add File Failed!"})

@app.route("/deleteProj")
def deleteProj():
	projId = request.args.get("projId")
	res = orm.transaction(dbDeleteProj, projId=projId)
	if res:
		projs = orm.getProjs()
		print(projs)
		return jsonify({"res": projs, "msg": "add File Succeed!"})
	else:
		return jsonify({"res": False, "msg": "add File Failed!"})

## Node
def dbAddNode(projId="0", parentId="0", name=""):
	node = orm.nodeAddNode(name)
	orm.projAddNode(projId, parentId, node)

def dbRmNode(projId="0", nodeId="0"):
	rmIds = orm.projRmNode(projId, nodeId)
	for rmId in list(rmIds):
		orm.nodeRmNode(rmId)
	
def dbUpdateNode(projId="0", nodeId="0", nodeType="node", extra=""): # nodeType && extra
	extraUrl = orm.nodeUdNode(projId, nodeId, nodeType, extra)
	orm.projUdNode(projId, nodeId, nodeType, extra, extraUrl)

@app.route("/addNode")
def addNode():
	projId = request.args.get("projId")
	parentId = request.args.get("parentId")
	name = request.args.get("name")
	print(projId, parentId, name)
	if orm.transaction(dbAddNode, projId=projId, parentId=parentId, name=name):
		res= orm.getProjJson(projId)
		print(res)
		return jsonify({"res": res, "msg": "add File Succeed!"})
	else:
		return jsonify({"res": False, "msg": "add File Failed!"})

@app.route("/rmNode")
def rmNode():
	projId = request.args.get("projId")
	nodeId = request.args.get("nodeId")
	print(projId, nodeId)
	if orm.transaction(dbRmNode, projId=projId, nodeId=nodeId):
		res= orm.getProjJson(projId)
		return jsonify({"res": res, "msg": "add File Succeed!"})
	else:
		return jsonify({"res": False, "msg": "add File Failed!"})

@app.route("/updateNode")
def updateNode():
	projId = request.args.get("projId")
	nodeId = request.args.get("nodeId")
	nodeType = request.args.get("type")
	extra =  request.args.get("extra")
	if orm.transaction(dbUpdateNode, projId=projId, nodeId=nodeId, nodeType=nodeType, extra=extra):
		res= orm.getProjJson(projId)
		return jsonify({"res": res, "msg": "add File Succeed!"})
	else:
		return jsonify({"res": False, "msg": "add File Failed!"})


@app.route("/updateContent", methods=["POST"])
def updateContent():
	data = request.get_json()
	nodeId = data["nodeId"]
	content = data["content"]
	num = orm.updateContent(nodeId, content)
	if num != 1:
		return jsonify({"res": False, "msg": "Update Content Failed!"})
	else:
		return jsonify({"res": data, "msg": "Update Content Succeed!"})



@app.route("/editExtra", methods=["POST"])
def editExtra():
	projId = request.form.get('projId')
	rmFileName = request.form.get('rmFile')
	print(request.files)
	addFile = request.files.get('addFile')
	extra = orm.getExtra(projId)
	if addFile and addFile.filename != "":
		extra.addFile(addFile)
	if rmFileName:
		extra.rmFile(rmFileName)
	return jsonify({"res": extra.listFiles(), "msg": "Edit Extra Succeed!"})

@app.route("/listExtra")
def listExtra():
	projId = request.args.get("projId")
	extra = orm.getExtra(projId)
	return jsonify({"res": extra.listFiles(), "msg": "List Extra Succeed!"})

## Extras 
'''
@app.route("/addExtra")
def addExtra():
	projId = request.args.get("projId")


@app.route("/deleteExtra")
def deleteExtra():
	projId = request.args.get("projId")
	fileName = request.args.get("projId")

@app.route("/getExtras")
def getExtras()
	projId = request.args.get("projId")

@app.route("/downExtra")
def downExtra()
	projId = request.args.get("projId")
	fileName = request.args.get("projId")

@app.route("/extra")
def extra()
	# serve extraf

## Content
@app.route("/updateContent",)
def updateContent():
	projId = request.args.get("projId")
	nodeId = request.args.get("nodeId")
'''

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=9400)