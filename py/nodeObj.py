import datetime,json,copy

class NodeObj:
	def __init__(self, jsonData):
		self.name = jsonData.get("name")
		self.nodeType = jsonData.get("nodeType")
		self.nodeId = jsonData.get("nodeId")
		self.extra = ""
		self.extraUrl = ""
		# child parent
		self.parentId = jsonData.get("parentId")
		self.parent = None
		self.children = []
		for child in jsonData.get("children",[]):
			childnode = NodeObj(child)
			childnode.parent = self
			childnode.parentId = self.nodeId 
			self.children.append(childnode)

	def toDict(self):
		res = {	"name":self.name, 
				"nodeType":self.nodeType, 
				"nodeId":self.nodeId,
				"parentId":self.parentId}
		if self.extra != "":
			res["extra"] = self.extra
			res["extraUrl"] = self.extraUrl
		if self.children ==[]:
			return res
		res["children"] = []
		for child in self.children:
			res["children"].append(child.toDict())
		return res

	def find(self, id):
		if self.nodeId == id:
			return self
		for child in self.children:
			res = child.find(id)
			if res!= None:
				return res
		return None

	def addChild(self, parentId, node):
		pnode = self.find(parentId)
		nodeObj = NodeObj(node)
		pnode.children.append(nodeObj)
		nodeObj.parent = pnode
		nodeObj.parentId = self.nodeId

	def rmChild(self, id):
		node = self.find(id)
		node.parent.children.remove(node)
		return node

	def updateChild(self, id, nodeType="node", extra="", extraUrl=""):
		node = self.find(id)
		node.nodeType = nodeType
		node.extra = extra
		node.extraUrl = extraUrl

	def getAllRmIds(self, nodeId="0"):
		if nodeId == "0": nodeObj = self
		else: nodeObj = self.find(nodeId) 
		res = set([nodeObj.nodeId])
		for child in nodeObj.children:
			res.add(child.nodeId)
			res = res.union(child.getAllRmIds())
		return res


if __name__ == "__main__":
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
							"nodeType":"md",
							"nodeId":"4",
							"parentId":"1",
						}
					]}
	node = NodeObj(jsonData)
	jsonData1 = node.toDict()
	print(json.dumps(jsonData1))
	node1 = NodeObj(jsonData1)
	
	node4 = node1.rmChild("4")
	print(node1.toDict())
	node1.addChild("2",node4.toDict())
	print(node1.toDict())
	print(node1.find("4"))
	node1.updateChild("4", "deck")
	print(node1.toDict())
	print(list(node1.getAllRmIds("1")))
