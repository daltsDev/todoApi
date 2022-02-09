exports.getTodo = (req, res, next) => {
  res.send({ todo: "Make this app great!" });
};

exports.getATodo = (req, res, next) => {
  const { id } = req.params;
  res.send({ todo: `Congrats you got your todo with Id:${id}` });
};

exports.createTodo;
