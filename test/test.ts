var { View, Connection } = require('zing-orm');

var options = {
    type: "oracle",
    user: "cxxtyls",
    password: "cxxtyls123",
    connectString: "190.3.1.13/incals"
};

@View("kl_cms_waredict_v")
export class Role {

    //   @Column("character varying", { name: "name", nullable: true })
    //   name: string | null;

}

(async () => {
    let oracleConnection;
    try {

        oracleConnection = await new Connection(options);
        let oracleRepository = await oracleConnection.getRepository(Role)
        await oracleRepository.getPage({ current: 1, pageSize: 10 });


        //todo  create Connection Class contain Driver and Repository 

    } catch (err) {
        //todo

        console.error(err);
    } finally {
        await oracleConnection.closeConnection();
    }
})();