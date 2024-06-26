const db = require("../models");
const SpesialisDokter = db.spesialisdokter;

// const Op = db.Sequelize.Op;
// const { Op } = require("sequelize");
const JSONAPISerializer = require("jsonapi-serializer").Serializer;

const { Op } = require("sequelize");

// Create and Save a new spesialis_dokter
exports.create = async (req, res) => {
  try {
    // Validate request
    // return res.status(400).send({ message: typeof req.body.nama_spesialis === 'undefined' });
    if (
      !req.body.nama_spesialis ||
      !req.body.harga
    //   !req.body.is_dokter_gigi
    ) {
      return res.status(400).send({ message: "Data is required!" });
    }

    // Create spesialis_dokter object with layanan_id
    const spesialis_dokter = {
      nama_spesialis: req.body.nama_spesialis,
      harga: req.body.harga,
      is_dokter_gigi: req.body.is_dokter_gigi
    };

    // Save spesialis_dokter to the database
    const createdSpesialisDokter = await SpesialisDokter.create(spesialis_dokter);
    res.send(createdSpesialisDokter);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: error.message || "Error creating spesialis_dokter." });
  }
};


// code benar tapi salah
exports.findAll = async (req, res) => {
  try {
    // Mendapatkan nilai halaman dan ukuran halaman dari query string (default ke halaman 1 dan ukuran 10 jika tidak disediakan)
    const page = parseInt(req.query.page) || 1;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // Menghitung offset berdasarkan halaman dan ukuran halaman
    const offset = (page - 1) * pageSize;
    const keyword = req.query.keyword || "";

    // Query pencarian
    const searchQuery = {
      // pengen nyari apa???
      where: {
        [Op.or]: [
          { nama_spesialis: { [Op.like]: `%${keyword}%` } },
          { is_dokter_gigi: { [Op.like]: `%${keyword}%` } },
          { harga: { [Op.like]: `%${keyword}%` } },
        ],
      },
      limit: pageSize,
      offset: offset,
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
    };

    const spesialis_dokter = await SpesialisDokter.findAll(searchQuery);
    const totalCount = await SpesialisDokter.count(searchQuery);
    // Menghitung total jumlah spesialis_dokter
    // const totalCount = await SpesialisDokter.count();

    // Menghitung total jumlah halaman berdasarkan ukuran halaman
    const totalPages = Math.ceil(totalCount / pageSize);

    // Menggunakan serializer untuk mengubah data menjadi JSON
    const serializedData = SpesialisDokterselializer.serialize(spesialis_dokter);
    
    // Kirim response dengan data JSON dan informasi pagination
    res.send({
      data: serializedData,
      currentPage: page,
      totalPages: totalPages,
      pageSize: pageSize,
      totalCount: totalCount,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error retrieving spesialis_dokters." });
  }
};

// serialize
const SpesialisDokterselializer = new JSONAPISerializer("spesialis_dokter", {
  attributes: [
    "nama_spesialis",
    "harga",
    "is_dokter_gigi",
   
  ],
  keyForAttribute: "underscore_case",
});


// Find a single admin with an id
exports.findOne = (req, res) => {
  const id = req.params.id;

  SpesialisDokter.findByPk(id)
    .then((data) => {
      if (data) {
        const serializedData = SpesialisDokterselializer.serialize(data);
        res.send(serializedData);
      } else {
        res.status(404).send({
          message: `Cannot find pasien with id=${id}.`,
        });
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send({
        message: "Error retrieving pasien with id=" + id,
      });
    });
};

// Update a spesialis_dokter by the id in the request
exports.update = async (req, res) => {
  const id = req.params.id;

  SpesialisDokter.update(req.body, {
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "spesialis_dokter was updated successfully.",
        });
      } else {
        res.send({
          message: `Cannot update spesialis_dokter with id=${id}. Maybe spesialis_dokter was not found or req.body is empty!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Error updating spesialis_dokter with id=" + id,
      });
    });
};

// Delete a spesialis_dokter with the specified id in the request
exports.delete = (req, res) => {
  const id = req.params.id;

  SpesialisDokter.destroy({
    where: { id: id },
  })
    .then((num) => {
      if (num == 1) {
        res.send({
          message: "spesialis_dokter was deleted successfully!",
        });
      } else {
        res.send({
          message: `Cannot delete spesialis_dokter with id=${id}. Maybe spesialis_dokter was not found!`,
        });
      }
    })
    .catch((err) => {
      res.status(500).send({
        message: "Could not delete spesialis_dokter with id=" + id,
      });
    });
};

// Delete all spesialis_dokters from the database.
exports.deleteAll = (req, res) => {
  SpesialisDokter.destroy({
    where: {},
    truncate: false,
  })
    .then((nums) => {
      res.send({
        message: `${nums} spesialis_dokters were deleted successfully!`,
      });
    })
    .catch((err) => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all spesialis_dokters.",
      });
    });
};
