from peewee import *
from playhouse.shortcuts import model_to_dict
import datetime,json,copy

from nodeObj import NodeObj
from extra import Extra
from utils import getTraceLog

db = SqliteDatabase('doc.db')
db.pragma('foreign_keys', 1, permanent=True)
# db.connect()

class JSONField(TextField):
    def db_value(self, value):
        return json.dumps(value)

    def python_value(self, value):
        if value is not None:
            return json.loads(value)

class BaseModel(Model):
    class Meta:
        database = db

class Proj(BaseModel):
	name = CharField(unique=True)
	jsonData = JSONField(default={})
	# extra = CharField(default="")

class Node(BaseModel):
	name = CharField(default="")
	content = TextField(default="")
	nodeType =  CharField(default="node")
	# extra = CharField(default="")
	extraUrl = CharField(default="")

def transaction(func, **keys):
	with db.atomic() as txn:
		try:
			res = func(**keys)
		except Exception as e:
			getTraceLog(e)
			txn.rollback()
			return False
	return True if not res else res

# Projs
def createProj(name, jsonData={}):
	proj = Proj.create(name=name, jsonData=jsonData)
	return proj

def deleteProj(projId):
	nodeObj = NodeObj(getProjJson(projId))
	num = Proj.delete().where(Proj.id == projId).execute()
	return nodeObj.getAllRmIds()

def getProj(projId):
	return Proj.get(Proj.id==projId)

def getProjs():
	res = []
	query = Proj.select()
	for proj in query:
		res.append({"id": str(proj.id), "name":proj.name})
	return res

def getProjJson(projId):
	proj = Proj.get(Proj.id == projId)
	return proj.jsonData

def updateJson(projId, jsonData):
	num = Proj.update(jsonData=jsonData).where(Proj.id == projId).execute()
	return num

def projAddNode(projId, parentId, nodeJson):
	jsonData = getProjJson(projId)
	nodeObj = NodeObj(jsonData)
	nodeObj.addChild(parentId, nodeJson)
	updateJson(projId, nodeObj.toDict())

def projRmNode(projId, nodeId):
	jsonData = getProjJson(projId)
	nodeObj = NodeObj(jsonData)
	rmIds = nodeObj.getAllRmIds(nodeId)
	nodeObj.rmChild(nodeId)
	updateJson(projId, nodeObj.toDict())
	return rmIds

def projUdNode(projId, nodeId, nodetype="node", extra="",  extraUrl=""):
	jsonData = getProjJson(projId)
	nodeObj = NodeObj(jsonData)
	nodeObj.updateChild(nodeId, nodetype, extra, extraUrl)
	updateJson(projId, nodeObj.toDict())

# Node
def getContent(nodeId):
	node = Node.get(Node.id == nodeId)
	return node.content

def getNodeJson(nodeId):
	node = Node.get(Node.id == nodeId)
	return {"content":node.content, "name":node.name}

def updateContent(nodeId, content):
	num = Node.update(content=content).where(Node.id == nodeId).execute()
	return num

def nodeAddNode(name):
	node = Node.create(name=name)
	res = {"name":name, "nodeType":node.nodeType, "nodeId":str(node.id)}
	return res

def nodeRmNode(nodeId):
	num = Node.delete().where(Node.id == nodeId).execute()
	return num

def nodeUdNode(projId, nodeId, nodeType="node", extra="", **kwargs):
	#TODO:  do extras
	extraUrl = ""
	if extra != "" and nodeType == "extra":
		extraUrl = getExtraBaseUrl(projId) + extra 
		Node.update(nodeType=nodeType, extraUrl=extraUrl).where(Node.id == nodeId).execute()
	else:
		Node.update(nodeType=nodeType).where(Node.id == nodeId).execute()
	return extraUrl

# Extra
def getExtra(projId):
	proj = getProj(projId)
	extra = Extra(proj.name)
	return extra

def getExtraBaseUrl(projId):
	extraObj = getExtra(projId)
	return extraObj.getBaseUrl()

if __name__ == "__main__":
	# print(createTag("Created Tag3!"))
	db.create_tables([Proj, Node])
	jsonData = {	"name":"root",
					"nodeType":"node",
					"nodeId":"1",
					"children":[{
							"name": "child1",
							"nodeType":"node",
							"nodeId":"2",
							"parentId":"1",
							"children":[{
								"name": "child2",
								"nodeType":"md",
								"nodeId":"3",
								"parentId":"2",
							}]
						},{
							"name": "child3",
							"nodeType":"deck",
							"nodeId":"4",
							"parentId":"1",
						}
					]}
	createProj("proj1", jsonData)
	#createProj("proj2", jsonData)
	Proj.get(Proj.id==1)
