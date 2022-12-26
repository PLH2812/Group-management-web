import { createContext, useEffect, useState } from "react";
import { getGroup, getProfileUser, createTableInGroup, getTableInGroup, getTask, getMyTask, getTaskByIdTable } from "../hooks/requests";

export const AppContext = createContext({})
var dataBoard = [
    {
        boardId: 1,
        name: 'Front-End',
        workid: 1,
        url: 'boar1',
    },
    {
        boardId: 2,
        name: 'Back-End',
        workid: 1,
        url: 'boar2',
    },
    {
        boardId: 3,
        name: 'DevOps',
        workid: 1,
        url: 'boar3',
    },

]
var data = [
    {
        name: 'Công nghệ phần mềm mới',
        id: 2
    },
    {
        name: 'Tiểu luận công nghệ phần mềm',
        id: 1
    }
]
export const AppProvider = ({ children }) => {
    const [work, setWork] = useState({})
    const [openDialog, setOpenDialog] = useState('')
    const [listWork, setListWork] = useState([])
    const [profile, setProfile] = useState({})
    const [task, setTask] = useState([])
    const [table, setTable] = useState([])
    const [render, setRender] = useState(false)
    const [boardDetail, setBoardDetail] = useState()
    const [myTask, setMyTask] = useState({})
    // console.log(task);
    // console.log(listWork);
    // console.log(listWork);
    // const getAllGroup = () => {
    //     getGroup().then(data => setListWork({
    //         loading: false,
    //         data: data,
    //     }))
    // }


    useEffect(() => {
        return async () => {
            setMyTask(await getMyTask())
        }
    }, [render]);

    // useEffect(() => {
    //     return async () => {
    //         setTask(await getTask())
    //     }
    // }, [render]);

    useEffect(() => {
        return async () => {
            setListWork(
                await getGroup()
            )
        }
    }, [render]);
    useEffect(() => {
        return async () => {
            setProfile(await getProfileUser())
        }
    }, [render]);
    useEffect(() => {

        return async () => {
            setTable(await getTableInGroup())

        }
    }, [render]);

    const getIdBoard = (board) => {
        setBoardDetail(board)
    }

    // const setSlug = (slug) => {

    // }

    const handleSubmit = (name, id) => {

        let table1 = {
            name: name,
            description: '',

            members: [{
                userId: profile._id,
                name: profile.name
            }],
            task: ['Task 1'],
            url: generateString(8),
        }
        // for (var i = 0; i < data.length; i++) {
        //     if (data[i].id == boardAdd.id) {
        //         dataBoard = [...dataBoard, boardAdd]
        //     }
        // }
        createTableInGroup(table1, id).then(res => setRender(res.ok))

        // setRender({
        //     loading:false,
        //     data:[...render.data, table1]
        // })
        // setTable(...table, table1)
        setOpenDialog('')

    }
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

    function generateString(length) {
        let result = ' ';
        const charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    const getTableId = (id) => {

        useEffect(() => {
            return async () => {
                setTask(await getTaskByIdTable(id))
            }
        }, [render]);

    }
    const context = {
        openDialog,
        setOpenDialog,
        work,
        setWork,
        listWork,
        dataBoard,
        handleSubmit,
        data,
        table,
        getIdBoard,
        boardDetail,
        render,
        setRender,
        task,
        setTask,
        myTask,
        profile,
        getTableId,


    }

    return <AppContext.Provider value={context}>
        {children}
    </AppContext.Provider>
}