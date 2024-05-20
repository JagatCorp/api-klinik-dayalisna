const db = require("../models");
const Transaksidistributor = db.transaksidistributors;
const Barangdistributor = db.barangdistributors;
const Pembelidistributors = db.pembelidistributors;
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op, where } = require("sequelize");

// Create and Save a new transaksidistributor
exports.create = async (req, res) => {
  try {
    // Validate request
    if (
      !req.body.jml_barang ||
      !req.body.harga ||
      !req.body.status ||
      !req.body.nama_pembeli ||
      !req.body.barang_distributorId
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Find Barangdistributor by Barangdistributor_id
    const dataBarangdistributor = await Barangdistributor.findByPk(
      req.body.barang_distributorId
    );
    if (!dataBarangdistributor) {
      return res.status(404).send({ message: "Barangdistributor not found!" });
    }

    // Create transaksidistributor object with Barangdistributor_id
    const transaksidistributor = {
      jml_barang: req.body.jml_barang,
      harga: req.body.harga,
      status: req.body.status,
      barang_distributorId: req.body.barang_distributorId,
      nama_pembeli: req.body.nama_pembeli,
      // Assign Barangdistributor_id from request body
    };

    // Save transaksidistributor to the database
    const createdTransaksidistributor = await Transaksidistributor.create(
      transaksidistributor
    );
    res.send(createdTransaksidistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: error.message || "Error creating transaksidistributor.",
    });
  }
};

// code benar tapi salah
exports.findAll = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;
    const offset = (page - 1) * pageSize;

    // Jika tidak ada query pencarian
    const keyword = req.query.keyword || "";
    const searchQuery = {
      where: {
        [Op.or]: [
          { jml_barang: { [Op.like]: `%${keyword}%` } },
          { harga: { [Op.like]: `%${keyword}%` } },
          { status: { [Op.like]: `%${keyword}%` } },
          { nama_pembeli: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
      // attributes: {
      //   exclude: ["createdAt", "updatedAt"],
      // },
    };

    const transaksidistributor = await Transaksidistributor.findAll(
      searchQuery
    );
    const totalCount = await Transaksidistributor.count();

    const totalPages = Math.ceil(totalCount / pageSize);

    res.send({
      data: transaksidistributor,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ message: "Error retrieving transaksidistributors." });
  }
};

// Find a single admin with an id
exports.findOne = async (req, res) => {
  const id = req.params.id;

  try {
    const transaksidistributor = await Transaksidistributor.findByPk(id, {
      include: [
        {
          model: Barangdistributor,
          attributes: ["nama_barang", "urlGambar"],
        },
      ],
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    });

    if (!transaksidistributor) {
      return res.status(404).send({
        message: `Cannot find transaksidistributor with id=${id}.`,
      });
    }

    res.send(transaksidistributor);
  } catch (error) {
    console.error(error);
    res.status(500).send({
      message: `Error retrieving transaksidistributor with id=${id}`,
    });
  }
};
// Update a transaksidistributor by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  Transaksidistributor.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksidistributor was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update transaksidistributor with id=${id}. Maybe transaksidistributor was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating transaksidistributor with id=" + id,
      });
    });
};

// Delete a transaksidistributor with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  Transaksidistributor.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "transaksidistributor was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete transaksidistributor with id=${id}. Maybe transaksidistributor was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete transaksidistributor with id=" + id,
      });
    });
};

// Delete all transaksidistributors from the database.
exports.deleteAll = (req, res) => {
  Transaksidistributor.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} transaksidistributors were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message ||
          "Some error occurred while removing all transaksidistributors.",
      });
    });
};
