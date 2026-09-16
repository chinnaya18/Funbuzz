const Question = require('../models/Question');

// Get all questions (optionally filter by difficulty)
exports.getAll = async (req, res) => {
  try {
    const { difficulty } = req.query;
    let query = {};
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await Question.find(query).sort({ difficulty: 1, questionNumber: 1 });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single question
exports.getById = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create question
exports.create = async (req, res) => {
  try {
    const { questionNumber, difficulty, questionText, points } = req.body;

    // Generate questionId based on difficulty
    const prefixMap = { chill: 'C', blaze: 'B', savage: 'SV', brutal: 'BR', legendary: 'L' };
    const prefix = prefixMap[difficulty];
    if (!prefix) {
      return res.status(400).json({ message: 'Invalid difficulty level' });
    }

    const questionId = `${prefix}${questionNumber}`;

    const question = await Question.create({
      questionNumber,
      difficulty,
      questionId,
      questionText,
      points: points || 0
    });

    res.status(201).json(question);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'A question with this number already exists for this difficulty' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update question
exports.update = async (req, res) => {
  try {
    const { questionText, points, status } = req.body;
    const updateData = {};

    if (questionText !== undefined) updateData.questionText = questionText;
    if (points !== undefined) updateData.points = points;
    if (status !== undefined) updateData.status = status;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Delete question
exports.remove = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update question status
exports.updateStatus = async (req, res) => {
  try {
    let { status } = req.body;
    if (status === 'in-progress') status = 'selected';
    if (!['available', 'selected', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const io = req.app.get('io');
    if (io) {
      io.emit('question:statusChanged', question);
    }

    res.json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Reset all questions to available
exports.resetAll = async (req, res) => {
  try {
    await Question.updateMany({}, { status: 'available' });
    const io = req.app.get('io');
    if (io) {
      io.emit('questions:reset', { status: 'available' });
    }
    res.json({ message: 'All questions reset to available' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
